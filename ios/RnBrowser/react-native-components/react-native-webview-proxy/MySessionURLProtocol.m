//
//  MySessionURLProtocol.m
//  TBPlayer
//
//  Created by zjbpha on 2017/3/2.
//  Copyright © 2017年 SF. All rights reserved.
//

#import "MySessionURLProtocol.h"
#import <React/RCTConvert.h>
#import "AppDelegate.h"

#define protocolKey @"SessionProtocolKey"

#define strIsEmpty(str) ([str isKindOfClass:[NSNull class]] || str == nil || [str length] < 1 ? YES : NO )
static BOOL proxySwitch = NO;
static BOOL proxyEnviroment = NO;

static NSString *proxy_host_ip = @"";
static NSNumber *proxy_host_port = nil;
static NSString *proxy_name = @"proxy_name";
static NSString *proxy_password = @"proxy_password";

NSString * const mobile4GBytes = @"mobile4GBytes";
NSString * const mobilefreeBytes = @"mobilefreeBytes";
NSString * const mobiledata = @"mobiledata";
NSString * const mobileMaxByte = @"mobileMaxByte";


@interface MySessionURLProtocol ()<NSURLSessionDataDelegate>

@property (nonatomic, strong) NSURLSession * session;

@end

@implementation MySessionURLProtocol

+ (void)setProxyEnvironmentSwitch:(BOOL)enable{
  proxyEnviroment = enable;
  if (!enable) {
    proxyEnviroment = [[[NSUserDefaults standardUserDefaults] valueForKey:@"Reachability"] boolValue];
  }
}

+ (void)setProxySwitchConfig:(NSDictionary *)option{
  
  [[NSUserDefaults standardUserDefaults] setValue:option forKey:@"ProxyConfigInfo"];
  [[NSUserDefaults standardUserDefaults] synchronize];
  [MySessionURLProtocol getProxySwitchConfig];
}

+ (void)getProxySwitchConfig{
  NSDictionary *dic = [[NSUserDefaults standardUserDefaults] valueForKey:@"ProxyConfigInfo"];
  if (!dic||![dic.allKeys containsObject:@"ip"]||strIsEmpty(dic[@"ip"])) {
    proxySwitch = NO;
    return;
  }
  proxySwitch = [RCTConvert BOOL:dic[@"enabled"]];
  proxy_host_ip = [RCTConvert NSString:dic[@"ip"]];
  proxy_host_port = [NSNumber numberWithInt:[RCTConvert int:dic[@"port"]]];
  proxy_name = [RCTConvert NSString:dic[@"userName"]];;
  proxy_password = [RCTConvert NSString:dic[@"password"]];;
  
  
}

/**
 *  是否拦截处理指定的请求
 *
 *  @param request 指定的请求
 *
 *  @return 返回YES表示要拦截处理，返回NO表示不拦截处理
 */
+ (BOOL)canInitWithRequest:(NSURLRequest *)request {
    
    /*
     防止无限循环，因为一个请求在被拦截处理过程中，也会发起一个请求，这样又会走到这里，如果不进行处理，就会造成无限循环
     */
    if ([NSURLProtocol propertyForKey:protocolKey inRequest:request]) {
        return NO;
    }
    
    NSString * url = request.URL.absoluteString;
    
    // 如果url已http或https开头，则进行拦截处理，否则不处理
    if (![url hasPrefix:@"http"] && ![url hasPrefix:@"https"]) {
        return NO;
    }
  
    return YES;
}

/**
 *  如果需要对请求进行重定向，添加指定头部等操作，可以在该方法中进行
 *
 *  @param request 原请求
 *
 *  @return 修改后的请求
 */
+ (NSURLRequest *)canonicalRequestForRequest:(NSURLRequest *)request {

    return [request copy];
}

/**
 *  开始加载，在该方法中，加载一个请求
 */
- (void)startLoading {
    NSMutableURLRequest * request = [self.request mutableCopy];
  
//    这里开关代理
  
    NSString *proxyHost = proxy_host_ip;//@"180.96.49.56";
    NSNumber *proxyPort = proxy_host_port;//@(8313);
    
    // 表示该请求已经被处理，防止无限循环
    [NSURLProtocol setProperty:@(YES) forKey:protocolKey inRequest:request];
    NSURLSessionConfiguration * config = [NSURLSessionConfiguration defaultSessionConfiguration];
    NSDictionary *proxyDict = @{
                                @"HTTPEnable"  : [NSNumber numberWithInt:1],
                                (NSString *)kCFStreamPropertyHTTPProxyHost  : proxyHost,
                                (NSString *)kCFStreamPropertyHTTPProxyPort  : proxyPort,
                                
                                @"HTTPSEnable" : [NSNumber numberWithInt:1],
                                (NSString *)kCFStreamPropertyHTTPSProxyHost : proxyHost,
                                (NSString *)kCFStreamPropertyHTTPSProxyPort : proxyPort,
                                };
  
  if (proxySwitch&&[AppDelegate reachability]) {
    NSUserDefaults *def = [NSUserDefaults standardUserDefaults];
    NSDate *date = [def valueForKey:mobiledata];
    if (!date) {
      config.connectionProxyDictionary = proxyDict;
    } else {
      NSCalendar *calendar = [[NSCalendar alloc]initWithCalendarIdentifier:NSCalendarIdentifierGregorian];
      unsigned units  = NSCalendarUnitMonth|NSCalendarUnitDay|NSCalendarUnitYear;
      NSDateComponents *_pre = [calendar components:units fromDate:date];
      NSDateComponents *_now = [calendar components:units fromDate:[NSDate date]];
      
      NSInteger pre_month = [_pre month];
      NSInteger now_month = [_now month];
      
      if (now_month - pre_month >= 1) {
        [def setValue:nil forKey:mobiledata];
        [def synchronize];
        config.connectionProxyDictionary = proxyDict;
      }
    }
  }
  
  
    self.session = [NSURLSession sessionWithConfiguration:config delegate:self delegateQueue:[NSOperationQueue mainQueue]];
    NSURLSessionDataTask * task = [self.session dataTaskWithRequest:request];
    [task resume];
}

/**
 *  取消请求
 */
- (void)stopLoading {
    [self.session invalidateAndCancel];
    self.session = nil;
}

- (BOOL)proxyablility{
  
  NSUserDefaults *def = [NSUserDefaults standardUserDefaults];
  NSDate *data = [def valueForKey:mobiledata];
  if (data) {
    return NO;
  }
  return proxySwitch&&[AppDelegate reachability];
}

#pragma mark - NSURLSessionDataDelegate

-(void)URLSession:(NSURLSession *)session task:(NSURLSessionTask *)task didCompleteWithError:(NSError *)error
{
    if (error) {
        [self.client URLProtocol:self didFailWithError:error];
    } else {
        [self.client URLProtocolDidFinishLoading:self];
    }
}

-(void)URLSession:(NSURLSession *)session dataTask:(NSURLSessionDataTask *)dataTask didReceiveResponse:(NSURLResponse *)response completionHandler:(void (^)(NSURLSessionResponseDisposition))completionHandler
{
    [self.client URLProtocol:self didReceiveResponse:response cacheStoragePolicy:NSURLCacheStorageNotAllowed];
    completionHandler(NSURLSessionResponseAllow);
}

-(void)URLSession:(NSURLSession *)session dataTask:(NSURLSessionDataTask *)dataTask didReceiveData:(NSData *)data
{
  if ([AppDelegate reachability]) {
    NSUserDefaults *def = [NSUserDefaults standardUserDefaults];
    NSDate *date = [def valueForKey:mobiledata];
    if (proxySwitch&&!date) {
      [AppDelegate add4gFlow:data.length freeFlow:data.length];
    } else {
      [AppDelegate add4gFlow:data.length freeFlow:0];
    }
  }
    [self.client URLProtocol:self didLoadData:data];
}

- (void)URLSession:(NSURLSession *)session dataTask:(NSURLSessionDataTask *)dataTask
 willCacheResponse:(NSCachedURLResponse *)proposedResponse
 completionHandler:(void (^)(NSCachedURLResponse *cachedResponse))completionHandler
{
    completionHandler(proposedResponse);
}

@end
