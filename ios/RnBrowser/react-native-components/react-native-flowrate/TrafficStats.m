//
//  TrafficStats.m
//  RnBrowser
//
//  Created by AZoo on 14/03/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import "TrafficStats.h"
#import "AppDelegate.h"
#import "MySessionURLProtocol.h"

@implementation TrafficStats
RCT_EXPORT_MODULE();

RCT_REMAP_METHOD(getMobileBytes,
                 getMobileBytes_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject){
  
  NSString *flow = [NSString stringWithFormat:@"%lld",[AppDelegate get4GFlow]];
  resolve(flow);
}


RCT_REMAP_METHOD(getFreeBytes,
                 getFreeBytes_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject){
  NSString *flow = [NSString stringWithFormat:@"%lld",[AppDelegate getFreeFlow]];
  resolve(flow);
}

RCT_EXPORT_METHOD(setFreeThreshold:(double)maxByte){
  NSUserDefaults *def = [NSUserDefaults standardUserDefaults];
  [def setValue:@(maxByte) forKey:mobileMaxByte];
  [def synchronize];
}









@end
