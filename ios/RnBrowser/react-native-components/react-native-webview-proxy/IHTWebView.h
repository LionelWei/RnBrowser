//
//  IHTWebView.h
//  RnBrowser
//
//  Created by AZoo on 11/01/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import "RCTView.h"

@class IHTWebView;
extern NSString *const RCTJSNavigationScheme;

@protocol IHTWebViewDelegate <NSObject>

- (BOOL)webView:(IHTWebView *)webView
shouldStartLoadForRequest:(NSMutableDictionary<NSString *, id> *)request
   withCallback:(RCTDirectEventBlock)callback;

@end

@interface IHTWebView : RCTView

@property (nonatomic, weak) id<IHTWebViewDelegate> delegate;

@property (nonatomic, copy) NSDictionary *source;
@property (nonatomic, assign) UIEdgeInsets contentInset;
@property (nonatomic, assign) BOOL automaticallyAdjustContentInsets;
@property (nonatomic, assign) BOOL messagingEnabled;
@property (nonatomic, copy) NSString *injectedJavaScript;
@property (nonatomic, assign) BOOL scalesPageToFit;

@property (nonatomic, readonly) float progress; // 0.0..1.0


- (void)goForward;
- (void)goBack;
- (void)reload;
- (void)stopLoading;
- (void)postMessage:(NSString *)message;

@end
