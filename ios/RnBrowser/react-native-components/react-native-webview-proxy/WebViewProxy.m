//
//  WebViewProxy.m
//  RnBrowser
//
//  Created by AZoo on 11/01/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import "WebViewProxy.h"
#import "MySessionURLProtocol.h"

@implementation WebViewProxy
RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(save:(NSDictionary *)options)
{
  NSLog(@"=====> %@",options);
//  enabled ?: bool;
//  ip ?: string;
//  port ?: number;
//  userName ?: string;
//  password ?: string;
  [MySessionURLProtocol setProxySwitchConfig:options];
  
  
}


@end
