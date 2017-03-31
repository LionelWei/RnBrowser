//
//  M3U8ParseDomain.m
//  LocalServer
//
//  Created by AZoo on 17/02/2017.
//  Copyright © 2017 Dazzle Interactive. All rights reserved.
//

#import "M3U8ParseDomain.h"
#import "AppDelegate.h"

NSString * const new_file_name = @"new_m3u8.m3u";
NSString * const HTTP = @"http://";
NSString * const EXTINF = @"#";

@implementation M3U8ParseDomain

- (BOOL)parse_m3u8_by_add_local_domain_with_v2_Path:(NSString *)path{
    
    NSError *error = nil;
    NSString *m3u8file = [NSString stringWithContentsOfFile:path encoding:kCFStringEncodingUTF8 error:&error];
    if (!m3u8file||error) {
        return false;
    }
    NSString *newm3u8file = @"";
    NSString *local_domain = [AppDelegate local_server];
    m3u8file = [m3u8file stringByReplacingOccurrencesOfString:@",\r" withString:@"\r"];
    m3u8file = [m3u8file stringByReplacingOccurrencesOfString:@"\r" withString:@""];
    
    do {
        
        NSInteger HTTP_location = [m3u8file rangeOfString:HTTP].location;
        if (HTTP_location != NSNotFound) {
            newm3u8file = [newm3u8file stringByAppendingString:[m3u8file substringToIndex:HTTP_location]];
            m3u8file = [m3u8file substringFromIndex:HTTP_location];
            NSInteger EXTINF_location = [m3u8file rangeOfString:EXTINF].location;
            if (EXTINF_location != NSNotFound) {
                NSString *url = [m3u8file substringToIndex:EXTINF_location];
                url = [url stringByReplacingOccurrencesOfString:@"\r" withString:@""];
                url = [url stringByReplacingOccurrencesOfString:@"\n" withString:@""];
                NSString *final_url = [NSString stringWithFormat:@"%@url=%@",local_domain,url];
                final_url = [final_url stringByAddingPercentEncodingWithAllowedCharacters:[NSCharacterSet URLQueryAllowedCharacterSet]];
//                newm3u8file = [newm3u8file stringByAppendingString:final_url];
                newm3u8file = [newm3u8file stringByAppendingFormat:@"%@", [NSString stringWithFormat:@"%@\r",final_url]];
                m3u8file = [m3u8file substringFromIndex:EXTINF_location];
            } else {
                m3u8file = [NSString stringWithFormat:@"%@url=%@",local_domain,m3u8file];
                newm3u8file = [newm3u8file stringByAppendingString:m3u8file];
                m3u8file = @"";
            }
            
        } else {
            newm3u8file = [newm3u8file stringByAppendingString:m3u8file];
            m3u8file = @"";
        }
    } while (m3u8file.length);
    
    BOOL ret = NO;
    if (newm3u8file) {
//        newm3u8file = [newm3u8file stringByReplacingOccurrencesOfString:@"," withString:@""];
        NSString *path = [[NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, true) firstObject] stringByAppendingPathComponent:new_file_name];
        NSFileManager *man = [NSFileManager defaultManager];
        if ([man fileExistsAtPath:path]) {
            [man removeItemAtPath:path error:nil];
        }
      NSLog(@"path is %@",path);
        ret = [newm3u8file writeToFile:path atomically:YES encoding:NSUTF8StringEncoding error:nil];
    }

    
    
    return ret;
}

- (BOOL)parse_m3u8_by_add_local_domain_withPath:(NSString *)path{
    
    NSError *error = nil;
    NSString *m3u8file = [NSString stringWithContentsOfFile:path encoding:kCFStringEncodingUTF8 error:&error];
    if (!m3u8file||error) {
        return false;
    }
    
    NSInteger pos = [m3u8file rangeOfString:@"#EXTINF:"].location;
    NSString *new_m3u8_file = [m3u8file substringToIndex:pos];
    
    NSMutableArray *m3u8_arr = [[m3u8file componentsSeparatedByString:@"\n"] mutableCopy];
    [m3u8_arr removeLastObject];
    do {
        [m3u8_arr removeObjectAtIndex:0];
    } while ([[m3u8_arr firstObject] rangeOfString:@"#EXTINF:"].location == NSNotFound);
    
    if (m3u8_arr.count == 0) {
        return false;
    }
    
    
    NSString *local_domain = [AppDelegate local_server];
    
    for (int i = 0; i < m3u8_arr.count - 2; ) {
        
        if ([[m3u8_arr objectAtIndex:i] rangeOfString:@"#EXT-X-DISCONTINUITY"].location != NSNotFound) {
            i++;
            continue;
        }
        
        NSString *duration_des = [m3u8_arr objectAtIndex:i];
        NSString *url = [[m3u8_arr objectAtIndex:i + 1] stringByAddingPercentEncodingWithAllowedCharacters:[NSCharacterSet URLQueryAllowedCharacterSet]];
        duration_des = [duration_des stringByReplacingOccurrencesOfString:@",\r" withString:@"\r\n"];

        NSString *local_url_current = [NSString stringWithFormat:@"%@url=%@\r\n",local_domain,url];
        new_m3u8_file = [new_m3u8_file stringByAppendingString:duration_des];
        new_m3u8_file = [new_m3u8_file stringByAppendingString:local_url_current];

        
        i+= 2;
    }
    
    new_m3u8_file = [new_m3u8_file stringByAppendingString:@"#EXT-X-ENDLIST\n"];
    
    BOOL ret = NO;
    if (new_m3u8_file) {
        NSString *path = [[NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, true) firstObject] stringByAppendingPathComponent:new_file_name];
        NSFileManager *man = [NSFileManager defaultManager];
        if ([man fileExistsAtPath:path]) {
            [man removeItemAtPath:path error:nil];
        }
        ret = [new_m3u8_file writeToFile:path atomically:YES encoding:NSUTF8StringEncoding error:nil];
    }
    return ret;
}

@end
