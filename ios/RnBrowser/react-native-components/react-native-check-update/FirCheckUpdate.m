//
//  FirCheckUpdate.m
//  RnBrowser
//
//  Created by AZoo on 23/03/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import "FirCheckUpdate.h"

@implementation FirCheckUpdate
RCT_EXPORT_MODULE();

RCT_REMAP_METHOD(checkUpdate,
                 token:(NSString *)token
                 checkUpdate_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject){
  
  
  NSString *bundleId = [[NSBundle mainBundle] infoDictionary][@"CFBundleIdentifier"];
  NSString *bundleIdUrlString = [NSString stringWithFormat:@"http://api.fir.im/apps/latest/%@?api_token=%@&type=ios", bundleId,token];
  NSURL *requestURL = [NSURL URLWithString:bundleIdUrlString];
  
  NSURLSession *session = [NSURLSession sharedSession];
  NSURLSessionTask *task = [session dataTaskWithURL:requestURL
                                  completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
                                    if (error) {
                                      reject(@"",@"",error);
                                      return;
                                    }
                                    NSDictionary *dic = [NSJSONSerialization JSONObjectWithData:data
                                                                                        options:NSJSONReadingAllowFragments
                                                                                          error:&error];
                                    if (error) {
                                      reject(@"",@"",error);
                                      return;
                                    }
                                    
                                    
                                    
                                    NSDictionary *infoDictionary = [[NSBundle mainBundle] infoDictionary];
                                    CFShow((__bridge CFTypeRef)(infoDictionary));
                                    float app_Version = [FirCheckUpdate convertVersion:[infoDictionary objectForKey:@"CFBundleShortVersionString"]];
                                    float dic_versionShort = [FirCheckUpdate convertVersion:dic[@"versionShort"]];
                                    
                                    if (app_Version < dic_versionShort) {
                                      resolve(@{@"downloadUrl":@"http://fir.im/qfeng",@"needUpdate":@YES});
                                    } else {
                                      resolve(@{@"needUpdate":@NO});
                                    }
                                    
                                    
  }];
  
  [task resume];
  
}

RCT_REMAP_METHOD(getCurrentVersion,
                 currentversion_resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject){
  NSDictionary *infoDictionary = [[NSBundle mainBundle] infoDictionary];
  CFShow((__bridge CFTypeRef)(infoDictionary));
  resolve([infoDictionary objectForKey:@"CFBundleShortVersionString"]);
}

//RCT_EXPORT_METHOD(getCurrentVersion){
//  NSDictionary *infoDictionary = [[NSBundle mainBundle] infoDictionary];
//  CFShow((__bridge CFTypeRef)(infoDictionary));
//  return [infoDictionary objectForKey:@"CFBundleShortVersionString"];
//}





+ (float)convertVersion:(NSString *)version{
  
  NSArray *arr = [version componentsSeparatedByString:@"."];
  float value = 0;
  int length = (int)arr.count;
  for (int i = 0; i < length; i++) {
    value += powf(10, length - 1 - i) *[arr[i] floatValue];
  }
  
  return value;
}






@end
