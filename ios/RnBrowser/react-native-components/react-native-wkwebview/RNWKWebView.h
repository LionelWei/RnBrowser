//
//  RNWKWebView.h
//  RnBrowser
//
//  Created by AZoo on 01/03/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import <React/RCTView.h>

@class RNWKWebView;
@protocol RNWKWebViewDelegate <NSObject>
- (BOOL)webView:(RNWKWebView *)webView
shouldStartLoadForRequest:(NSMutableDictionary<NSString *, id> *)request
   withCallback:(RCTDirectEventBlock)callback;

@end

@interface RNWKWebView : RCTView

@property (nonatomic, weak) id<RNWKWebViewDelegate> delegate;

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
