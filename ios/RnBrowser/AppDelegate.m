/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import "WebViewProtocol.h"
#import "RCTBundleURLProvider.h"
#import "RCTRootView.h"
#import "AFNetworkReachabilityManager.h"
#import "PhoneMode.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSURL *jsCodeLocation;

  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];
//  [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:nil fallbackResource:@"index.ios"];

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"RnBrowser"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
//  注册 代理
  [NSURLProtocol registerClass:[WebViewProtocol class]];
//  本地代理
  [WebViewProtocol getProxySwitchConfig];
  
  [[AFNetworkReachabilityManager sharedManager] setReachabilityStatusChangeBlock:^(AFNetworkReachabilityStatus status) {
    NSLog(@"Reachability: %@", AFStringFromNetworkReachabilityStatus(status));
    if (status == AFNetworkReachabilityStatusReachableViaWWAN) {
      //3G 或 4G
      // 判读 电信
      [WebViewProtocol setProxyEnvironmentSwitch:[PhoneMode isCTCC]];
    }else{
      //其他
      [WebViewProtocol setProxyEnvironmentSwitch:NO];
    }
  }];
  
  [[AFNetworkReachabilityManager sharedManager] startMonitoring];
  
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

@end
