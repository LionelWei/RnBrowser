//
//  ProxyPerClient.h
//  RnBrowser
//
//  Created by AZoo on 22/01/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface ProxyPerClient : NSObject

int start_proxy_server(const char* strip, int port);

@end
