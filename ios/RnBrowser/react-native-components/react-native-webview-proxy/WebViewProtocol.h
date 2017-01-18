//
//  WebViewProtocol.h
//  RnBrowser
//
//  Created by AZoo on 06/01/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface WebViewProtocol : NSURLProtocol

+ (void)setProxyEnvironmentSwitch:(BOOL)enable;
/// 供js 掉
+ (void)setProxySwitchConfig:(NSDictionary *)option;

+ (void)getProxySwitchConfig;

@end
