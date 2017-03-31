//
//  MySessionURLProtocol.h
//  TBPlayer
//
//  Created by zjbpha on 2017/3/2.
//  Copyright © 2017年 SF. All rights reserved.
//

#import <Foundation/Foundation.h>

extern NSString * const mobile4GBytes;
extern NSString * const mobilefreeBytes;
extern NSString * const mobiledata;
extern NSString * const mobileMaxByte;

@interface MySessionURLProtocol : NSURLProtocol

+ (void)setProxyEnvironmentSwitch:(BOOL)enable;
/// 供js 掉
+ (void)setProxySwitchConfig:(NSDictionary *)option;

+ (void)getProxySwitchConfig;

@end
