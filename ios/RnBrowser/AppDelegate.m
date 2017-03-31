/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import <CodePush/CodePush.h>
#import "WebViewProtocol.h"
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import "AFNetworkReachabilityManager.h"
#import "PhoneMode.h"
#import "GCDWebServer.h"
#import "GCDWebServerErrorResponse.h"
#import "HTTPServer.h"
#import "MySessionURLProtocol.h"
#import <libkern/OSAtomic.h>
#import <KSCrash/KSCrashInstallationStandard.h>


#define strIsEmpty(str) ([str isKindOfClass:[NSNull class]] || str == nil || [str length] < 1 ? YES : NO )

static NSString const * BugHDKey = @"84ec03dc29dd833da781e7a215a7603f";

@interface AppDelegate()

@property (nonatomic, strong) GCDWebServer *webServer;
@property (nonatomic, strong) NSURLSession *sesstion;
@property (nonatomic, strong) HTTPServer *httpServer;

@property (nonatomic) long long total_flow;


@end

@implementation AppDelegate

static BOOL reachability = NO;

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSURL *jsCodeLocation;
#ifdef DEBUG
    jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];
#else
    jsCodeLocation = [CodePush bundleURL];
#endif
//  [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:nil fallbackResource:@"index.ios"];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"RnBrowser"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
  
  Class cls = NSClassFromString(@"WKBrowsingContextController");
  SEL sel = NSSelectorFromString(@"registerSchemeForCustomProtocol:");
  if ([(id)cls respondsToSelector:sel]) {
    // 把 http 和 https 请求交给 NSURLProtocol 处理
    [(id)cls performSelector:sel withObject:@"http"];
    [(id)cls performSelector:sel withObject:@"https"];
  }
//  注册 代理
//  [NSURLProtocol registerClass:[WebViewProtocol class]];
  [NSURLProtocol registerClass:[MySessionURLProtocol class]];
//  本地代理
  [MySessionURLProtocol getProxySwitchConfig];
  
  [[AFNetworkReachabilityManager sharedManager] setReachabilityStatusChangeBlock:^(AFNetworkReachabilityStatus status) {
    NSLog(@"Reachability: %@", AFStringFromNetworkReachabilityStatus(status));
    if (status == AFNetworkReachabilityStatusReachableViaWWAN) {
      //3G 或 4G
      // 判读 电信
      [MySessionURLProtocol setProxyEnvironmentSwitch:[PhoneMode isCTCC]];
      reachability = YES;
    }else{
      //其他
      [[NSUserDefaults standardUserDefaults] setValue:0 forKey:@"Reachability"];
      [[NSUserDefaults standardUserDefaults] synchronize];
      [MySessionURLProtocol setProxyEnvironmentSwitch:NO];
      reachability = NO;
    }
    
#ifdef DEBUG
//    [MySessionURLProtocol setProxyEnvironmentSwitch:YES];
#endif
    
  }];

  [[AFNetworkReachabilityManager sharedManager] startMonitoring];
  [self startServe];
  [self startHttpServer];
  [self kscrash];
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

- (void)kscrash{
  KSCrashInstallationStandard* installation = [KSCrashInstallationStandard sharedInstance];
  NSString *key = [NSString stringWithFormat:@"https://collector.bughd.com/kscrash?key=%@",BugHDKey];
  installation.url = [NSURL URLWithString:key];
  [installation install];
  [installation sendAllReportsWithCompletion:nil];
}

- (void)startHttpServer{
  _httpServer = [[HTTPServer alloc] init];
  [_httpServer setType:@"_http._tcp."];
  [_httpServer setPort:12345];
  NSString * webLocalPath = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, true) firstObject];
  [_httpServer setDocumentRoot:webLocalPath];
  
  NSLog(@"Setting document root: %@", webLocalPath);
  
  NSError * error;
  if([_httpServer start:&error]){
    NSLog(@"start server success in port %d %@",[_httpServer listeningPort],[_httpServer publishedName]);
  } else {
    NSLog(@"启动失败");
  }
}

- (void)startServe{
  _webServer = [[GCDWebServer alloc]init];
  __weak typeof(&* self) weak_self = self;
  
  [_webServer addDefaultHandlerForMethod:@"GET"
                            requestClass:[GCDWebServerRequest class]
                       asyncProcessBlock:^(GCDWebServerRequest *request, GCDWebServerCompletionBlock completionBlock) {
                         __strong typeof(&* weak_self) strong_self = weak_self;
                         
                         NSInteger pos = [request.URL.absoluteString rangeOfString:@"url="].location;
                         if (pos == NSNotFound) {
                           return;
                         }
                         NSString *urlString = [request.URL.absoluteString substringFromIndex:pos + 4];
                         NSURL *url = [NSURL URLWithString:urlString];
                         // 分离 地址
                         NSLog(@"url is %@",url);
                         NSURLSessionTask *task = [strong_self.sesstion dataTaskWithURL:url completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
                           if (error) {
                             GCDWebServerErrorResponse *gcd_error = [GCDWebServerErrorResponse responseWithClientError:kGCDWebServerHTTPStatusCode_NotFound underlyingError:error message:@"发送错误"];
                             completionBlock(gcd_error);
                             return;
                           }
                           
                           NSString *contentType = response.MIMEType;
                           GCDWebServerResponse *gcd_response = [GCDWebServerDataResponse responseWithData:data contentType:contentType];
                           completionBlock(gcd_response);
                         }];
                         
                         [task resume];
                       }];
  [_webServer startWithPort:8090 bonjourName:nil];
  NSLog(@"Visit %@ in your web browser", _webServer.serverURL);
  
}

+ (NSString *)local_server{
  AppDelegate *appdelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  if (strIsEmpty(appdelegate.webServer.serverURL.absoluteString)) {
    return @"http://127.0.0.1:8090/";
  }
  return appdelegate.webServer.serverURL.absoluteString;
}

- (NSURLSession *)sesstion{
  if (_sesstion == nil) {
    NSURLSessionConfiguration * config = [NSURLSessionConfiguration defaultSessionConfiguration];
    _sesstion = [NSURLSession sessionWithConfiguration:config];
    _sesstion = [NSURLSession sharedSession];
  }
  return _sesstion;
}

OSSpinLock ospin = OS_SPINLOCK_INIT;

+ (void)add4gFlow:(double)fg freeFlow:(double)free{
  if (OSSpinLockTry(&ospin)) {
  
    NSUserDefaults *def = [NSUserDefaults standardUserDefaults];
    double m4g = [[def valueForKey:mobile4GBytes] longLongValue];
    double mfre = [[def valueForKey:mobilefreeBytes] longLongValue];
    
    double maxbyte = [[def valueForKey:mobileMaxByte] longValue];
    
    if (mfre <= maxbyte) {//powf(2, 31)//1024*1024*1024*2
      m4g += fg;
      mfre += free;
      
      [def setValue:@(m4g) forKey:mobile4GBytes];
      [def setValue:@(mfre) forKey:mobilefreeBytes];
      [def synchronize];
    } else {
      [def setValue:[NSDate date] forKey:mobiledata];
      [def synchronize];
    }
    
    
    
    OSSpinLockUnlock(&ospin);
  }
}


+ (long long)get4GFlow{
  NSUserDefaults *def = [NSUserDefaults standardUserDefaults];
  long long m4g = [[def valueForKey:mobile4GBytes] longLongValue];
  return m4g;
}

+ (long long)getFreeFlow{
  NSUserDefaults *def = [NSUserDefaults standardUserDefaults];
  long long mfre = [[def valueForKey:mobilefreeBytes] longLongValue];
  
  return mfre;
}

+ (BOOL)reachability{
  return reachability;
}

@end
