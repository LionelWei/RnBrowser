//
//  PhoneMode.m
//  RnBrowser
//
//  Created by AZoo on 16/01/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import "PhoneMode.h"
#import <CoreTelephony/CTTelephonyNetworkInfo.h>
#import <CoreTelephony/CTCarrier.h>

@implementation PhoneMode

+ (BOOL)isCTCC{
  CTTelephonyNetworkInfo *networkInfo = [[CTTelephonyNetworkInfo alloc] init];
//  NSLog(@"%@",networkInfo.currentRadioAccessTechnology);
//  NSLog(@"%@",networkInfo.subscriberCellularProvider.carrierName);
//  NSLog(@"%@",networkInfo.subscriberCellularProvider.mobileCountryCode);
//  NSLog(@"%@",networkInfo.subscriberCellularProvider.mobileNetworkCode);
//  NSLog(@"%@",networkInfo.subscriberCellularProvider.isoCountryCode);
  if (networkInfo.currentRadioAccessTechnology != CTRadioAccessTechnologyLTE) {
    return NO;
  }
  if ([networkInfo.subscriberCellularProvider.carrierName isEqualToString:@"中国电信"]) {
    return YES;
  }
  
  return NO;
}

@end
