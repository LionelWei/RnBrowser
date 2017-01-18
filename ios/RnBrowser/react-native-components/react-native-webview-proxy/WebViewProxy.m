//
//  WebViewProxy.m
//  RnBrowser
//
//  Created by AZoo on 11/01/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import "WebViewProxy.h"
#import "WebViewProtocol.h"

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
  [WebViewProtocol setProxySwitchConfig:options];
  
  
}


@end
