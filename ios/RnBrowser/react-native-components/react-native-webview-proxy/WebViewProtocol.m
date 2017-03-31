//
//  WebViewProtocol.m
//  RnBrowser
//
//  Created by AZoo on 06/01/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import "WebViewProtocol.h"
#import <React/RCTConvert.h>
#import "AppDelegate.h"

static NSString *protocolKey = @"SessionProtocolKey";
static NSURLSession *session;
static BOOL proxySwitch = NO;
static BOOL proxyEnviroment = NO;

static NSString *proxy_host_ip = @"";
static NSNumber *proxy_host_port = nil;
static NSString *proxy_name = @"proxy_name";
static NSString *proxy_password = @"proxy_password";

#define strIsEmpty(str) ([str isKindOfClass:[NSNull class]] || str == nil || [str length] < 1 ? YES : NO )


@interface WebViewProtocol ()<NSURLSessionDataDelegate>
@property (nonatomic, strong) NSURLSessionDataTask *task;
@end

@implementation WebViewProtocol

+ (void)setProxyEnvironmentSwitch:(BOOL)enable{
#ifdef DEBUG
  proxyEnviroment = YES;
#else
  proxyEnviroment = enable;
#endif
//  proxyEnviroment = NO;
  
  
}

+ (void)setProxySwitchConfig:(NSDictionary *)option{
  
  [[NSUserDefaults standardUserDefaults] setValue:option forKey:@"ProxyConfigInfo"];
  [[NSUserDefaults standardUserDefaults] synchronize];
  [WebViewProtocol getProxySwitchConfig];
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

+ (BOOL)canInitWithRequest:(NSURLRequest *)request {
  return NO;
  if ([NSURLProtocol propertyForKey:protocolKey inRequest:request]) {
    return NO;
  }
  /// 本地 文件 不走 代理
  if ([request.URL.host isEqualToString:@"127.0.0.1"]) {
    return NO;
  }
  
  NSString *local = [AppDelegate local_server];
  if ([request.URL.absoluteString containsString:local]) {
    return NO;
  }
  
  return proxySwitch&&proxyEnviroment;
}

+ (NSURLRequest *)canonicalRequestForRequest:(NSURLRequest *)request {
  return request;
}

+ (BOOL)requestIsCacheEquivalent:(NSURLRequest *)a toRequest:(NSURLRequest *)b {
  return [super requestIsCacheEquivalent:a toRequest:b];
}

- (void)startLoading
{
  NSMutableURLRequest * request = [self.request mutableCopy];
  [NSURLProtocol setProperty:@(YES) forKey:protocolKey inRequest:request];
  
  if (!session) {
    NSURLSessionConfiguration *configuration = [NSURLSessionConfiguration defaultSessionConfiguration];
    configuration.connectionProxyDictionary =
    @{(NSString *)kCFStreamPropertyHTTPProxyHost: proxy_host_ip,//@"180.96.49.56",//
      (NSString *)kCFStreamPropertyHTTPProxyPort: proxy_host_port//@(8313)//
      };
    session = [NSURLSession sessionWithConfiguration:configuration];
  }
  
  __weak typeof(self)weakSelf = self;
  self.task = [session dataTaskWithRequest:self.request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
    if (error) {
      [weakSelf.client URLProtocol:weakSelf didFailWithError:error];
    } else {
      [weakSelf.client URLProtocol:weakSelf didReceiveResponse:response cacheStoragePolicy:NSURLCacheStorageAllowed];
      [weakSelf.client URLProtocol:weakSelf didLoadData:data];
      [weakSelf.client URLProtocolDidFinishLoading:weakSelf];
    }
  }];
  [self.task resume];
}

- (void)stopLoading {
  [self.task cancel];
}


@end
