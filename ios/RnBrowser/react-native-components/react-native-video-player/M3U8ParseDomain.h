//
//  M3U8ParseDomain.h
//  LocalServer
//
//  Created by AZoo on 17/02/2017.
//  Copyright © 2017 Dazzle Interactive. All rights reserved.
//

#import <Foundation/Foundation.h>

extern NSString * const new_file_name;

@interface M3U8ParseDomain : NSObject

- (BOOL)parse_m3u8_by_add_local_domain_with_v2_Path:(NSString *)path;
- (BOOL)parse_m3u8_by_add_local_domain_withPath:(NSString *)path;

@end
