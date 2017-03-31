//
//  RNWKWebView.m
//  RnBrowser
//
//  Created by AZoo on 01/03/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import "RNWKWebView.h"

#import <WebKit/WebKit.h>

#import <React/RCTAutoInsetsProtocol.h>
#import <React/RCTConvert.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#import <React/RCTView.h>
#import <React/UIView+React.h>

#import <JavaScriptCore/JavaScriptCore.h>
#import "M3U8ParseDomain.h"
#import "TBPlayer.h"

NSString *WK_completeRPCURLPath = @"/njkwebviewprogressproxy/complete";

NSString *const WKJSNavigationScheme = @"react-js-navigation";
NSString *const WKJSPostMessageHost = @"postMessage";

NSString *const WKVideoHandlerScheme = @"videohandler://";

const float WKInitialProgressValue = 0.1f;
const float WKInteractiveProgressValue = 0.5f;
const float WKFinalProgressValue = 0.9f;

@interface RNWKWebView()<RCTAutoInsetsProtocol,WKUIDelegate,WKNavigationDelegate,UIGestureRecognizerDelegate,WKScriptMessageHandler>

@property (nonatomic, copy) RCTDirectEventBlock onLoadingStart;
@property (nonatomic, copy) RCTDirectEventBlock onLoadingFinish;
@property (nonatomic, copy) RCTDirectEventBlock onLoadingError;
@property (nonatomic, copy) RCTDirectEventBlock onShouldStartLoadWithRequest;
@property (nonatomic, copy) RCTDirectEventBlock onMessage;
@property (nonatomic, copy) RCTDirectEventBlock onProgressChange;

@property (nonatomic, strong) NSMutableArray *TXPlayLists;
@property (nonatomic, strong) NSTimer *txtimer;
@property (nonatomic, strong) M3U8ParseDomain *m3u8_parse_domain;

@end

@implementation RNWKWebView
{
  WKWebView *_webView;
  NSString *_injectedJavaScript;
  
  NSUInteger _loadingCount;
  NSUInteger _maxLoadCount;
  NSURL *_currentURL;
  BOOL _interactive;
}

- (void)dealloc
{
  _webView.UIDelegate = nil;
  _webView.navigationDelegate = nil;
  [_webView removeObserver:self forKeyPath:@"estimatedProgress"];
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if ((self = [super initWithFrame:frame])) {
    _TXPlayLists = [NSMutableArray new];
    _maxLoadCount = _loadingCount = 0;
    _interactive = NO;
    
    super.backgroundColor = [UIColor clearColor];
    _automaticallyAdjustContentInsets = YES;
    _contentInset = UIEdgeInsetsZero;
    
    WKWebViewConfiguration * Configuration = [[WKWebViewConfiguration alloc]init];
    //允许视频播放
    Configuration.allowsAirPlayForMediaPlayback = YES;
    // 允许在线播放
    Configuration.allowsInlineMediaPlayback = YES;
    // 允许可以与网页交互，选择视图
    Configuration.selectionGranularity = YES;
    //创建更改数据源
    NSString *JS = @"(function(){\
    var videos = document.getElementsByTagName('video');\
    window.webkit.messageHandlers.NativeLog.postMessage( 'videos length :' + videos.length);\
    window.webkit.messageHandlers.NativeLog.postMessage( 'window host :' + window.location.host);\
    if (window.location.host.indexOf('v.qq.com') > 0){\
      window.webkit.messageHandlers.NativeLog.postMessage('->enter');\
      var childNodes= [];\
      try {\
        childNodes = document.getElementsByClassName('txp_video_container')[0].childNodes;\
      } catch (error) {\
        window.webkit.messageHandlers.NativeLog.postMessage('->error');\
      }\
      window.webkit.messageHandlers.NativeLog.postMessage(childNodes.length);\
      var url = childNodes[1].src;\
      window.webkit.messageHandlers.NativeLog.postMessage('video_url://' + url);\
    } else {\
      for (var num = 0; num < videos.length; num ++){\
        let element = videos[num];\
        window.webkit.messageHandlers.NativeLog.postMessage('->start');\
        window.webkit.messageHandlers.NativeLog.postMessage(element.id + '');\
        if (element.id.indexOf('tenvideo_video_player_0') < 0) {\
          if (element.betaged == 1) continue;\
          element.betaged = 1;\
          element.addEventListener('loadstart',function(){\
          if (element.src.indexOf('null') > 0 ) return;\
            video_action(element);\
          },false);\
          if (window.location.host.indexOf('v.qq.com') > 0) element.play();\
          window.webkit.messageHandlers.NativeLog.postMessage('end');\
        }\
      }\
    }\
    function video_action(element) {\
      var videoUrl = 'video_url://';\
      window.webkit.messageHandlers.NativeLog.postMessage('host:' + document.location.host);\
      if (document.location.host.indexOf('bilibili.com') >=0) {\
        var sub_nodes = element.childNodes;\
        vidoUrl = vidoUrl + sub_nodes[1].src;\
      } else {\
        vidoUrl = vidoUrl + element.src;\
      }\
      window.webkit.messageHandlers.NativeMethod.postMessage(videoUrl);\
      element.preload = 'none';\
      element.pause();\
      element.src = 'null';\
      element.autoplay = 'none';\
      element.style.display = 'none';\
    }\
    window.postMessage = function(data){\
      let url = 'react-js-navigation://postMessage?encodeURIComponent(String(data));'\
      window.webkit.messageHandlers.NLocation.postMessage('nihao');\
    }\
    })();";
//    @"window.originalPostMessage = window.postMessage;"
//    "window.postMessage = function(data) {"
//    "let urlString = '%@://%@?' + encodeURIComponent(String(data));"
//    "window.webkit.messageHandlers.Location.postMessage(urlString);"
//    "};", WKJSNavigationScheme, WKJSPostMessageHost
    JS = @"window.webkit.messageHandlers.NativeLog.postMessage('**********************************************************')";
    WKUserScript * script = [[WKUserScript alloc] initWithSource:JS injectionTime:WKUserScriptInjectionTimeAtDocumentEnd forMainFrameOnly:YES];
    WKUserContentController * UserContentController = [[WKUserContentController alloc]init];
    [UserContentController addScriptMessageHandler:self name:@"NativeMethod"];
    [UserContentController addScriptMessageHandler:self name:@"NativeLog"];
    [UserContentController addScriptMessageHandler:self name:@"NLocation"];
    [UserContentController addUserScript:script];
    // 是否支持记忆读取
    Configuration.suppressesIncrementalRendering = YES;
    // 允许用户更改网页的设置
    Configuration.userContentController = UserContentController;
    
    
    _webView = [[WKWebView alloc]initWithFrame:self.bounds configuration:Configuration];
    _webView.navigationDelegate = self;
    _webView.UIDelegate = self;
    _webView.allowsBackForwardNavigationGestures = YES;
    [self addSubview:_webView];
  
    
    [_webView addObserver:self forKeyPath:@"estimatedProgress" options:NSKeyValueObservingOptionNew| NSKeyValueObservingOptionOld context:nil];
    
//    UILongPressGestureRecognizer *longPress = [[UILongPressGestureRecognizer alloc] initWithTarget:self action:@selector(handleLongPress:)];
//    longPress.minimumPressDuration = 1;
//    longPress.delegate = self;
//    [_webView addGestureRecognizer:longPress];
    
    
    
  }
  return self;
}

//- (void)handleLongPress:(UILongPressGestureRecognizer *)sender{
//  if (sender.state != UIGestureRecognizerStateBegan) {
//    return;
//  }
//  CGPoint touchPoint = [sender locationInView:_webView];
//  // 获取长按位置对应的图片url的JS代码
//  NSString *imgJS = [NSString stringWithFormat:@"document.elementFromPoint(%f, %f).src", touchPoint.x, touchPoint.y];
//  // 执行对应的JS代码 获取url
//  [_webView evaluateJavaScript:imgJS completionHandler:^(id _Nullable imgUrl, NSError * _Nullable error) {
//    if (imgUrl) {
//      NSData *data = [NSData dataWithContentsOfURL:[NSURL URLWithString:imgUrl]];
//      UIImage *image = [UIImage imageWithData:data];
//      if (!image) {
//        NSLog(@"读取图片失败");
//        return;
//      }
//      
//    }
//  }];
//}

- (void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message{
  NSString *messageName = message.name;
  NSLog(@"message is %@,name is %@",message.body,message.name);
  if ([@"NativeMethod" isEqualToString:messageName]) {
    id messageBody = message.body;
    NSLog(@"%@",messageBody);
    NSString *videoUrl = messageBody;
    NSInteger pos = [videoUrl rangeOfString:@"video_url://"].location;
    NSInteger length = [videoUrl rangeOfString:@"video_url://"].length;
    videoUrl = [videoUrl substringFromIndex:pos + length];
    
    if ([videoUrl rangeOfString:@"qq.com"].location != NSNotFound) {
      [_TXPlayLists addObject:videoUrl];
      if ([self.txtimer isValid]) {
        [self.txtimer invalidate];
        self.txtimer = nil;
      }
      [self.txtimer isValid];
    } else {
      if ([self.txtimer isValid]) {
        [self.txtimer invalidate];
        self.txtimer = nil;
      }
      
      if ([videoUrl rangeOfString:@"acgvideo.com"].location != NSNotFound) {
        [self callvideoInUrl:videoUrl];
      } else {
        [self anotherMethod_download_m3u8:videoUrl];
      }
    }
  } else if ([@"NativeLog" isEqualToString:messageName]) {
    NSLog(@"------->NativeLog is %@",message.body);
  } else if ([@"NLocation" isEqualToString:messageName]) {
    NSURL *url = [NSURL URLWithString:message.body];
    NSString *data = url.query;
    data = [data stringByReplacingOccurrencesOfString:@"+" withString:@" "];
    data = [data stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
    
    NSMutableDictionary<NSString *, id> *event = [self baseEvent];
    [event addEntriesFromDictionary: @{
                                       @"data": data,
                                       }];
    _onMessage(event);

  }
}


- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary *)change context:(void *)context{
  if ([keyPath isEqual: @"estimatedProgress"] && object == _webView) {
    [self setProgress:_webView.estimatedProgress];
    if(_webView.estimatedProgress >= 1.0f){
      [self completeProgress];
    }
  }
  else {
    [super observeValueForKeyPath:keyPath ofObject:object change:change context:context];
  }
}



RCT_NOT_IMPLEMENTED(- (instancetype)initWithCoder:(NSCoder *)aDecoder)

- (void)goForward{
  [_webView goForward];
}
- (void)goBack{
  [_webView goBack];
}

- (void)reload{
  NSURLRequest *request = [RCTConvert NSURLRequest:self.source];
  if (request.URL) {
    [_webView loadRequest:request];
  }
  else {
    [_webView reload];
  }
}

- (void)stopLoading{
  [_webView stopLoading];
}

- (void)postMessage:(NSString *)message{
  NSDictionary *eventInitDict = @{
                                  @"data": message,
                                  };
  NSString *source = [NSString
                      stringWithFormat:@"document.dispatchEvent(new MessageEvent('message', %@));",
                      RCTJSONStringify(eventInitDict, NULL)
                      ];
  [_webView evaluateJavaScript:source completionHandler:nil];
}


- (void)setSource:(NSDictionary *)source
{
  if (![_source isEqualToDictionary:source]) {
    _source = [source copy];
    
    // Check for a static html source first
    NSString *html = [RCTConvert NSString:source[@"html"]];
    if (html) {
      NSURL *baseURL = [RCTConvert NSURL:source[@"baseUrl"]];
      if (!baseURL) {
        baseURL = [NSURL URLWithString:@"about:blank"];
      }
      [_webView loadHTMLString:html baseURL:baseURL];
      return;
    }
    
    NSURLRequest *request = [RCTConvert NSURLRequest:source];
    // Because of the way React works, as pages redirect, we actually end up
    // passing the redirect urls back here, so we ignore them if trying to load
    // the same url. We'll expose a call to 'reload' to allow a user to load
    // the existing page.
    if ([request.URL isEqual:_webView.URL]) {
      return;
    }
    if (!request.URL) {
      // Clear the webview
      [_webView loadHTMLString:@"" baseURL:nil];
      return;
    }
    [_webView loadRequest:request];
  }
}

- (void)layoutSubviews
{
  [super layoutSubviews];
  _webView.frame = self.bounds;
}

- (void)setContentInset:(UIEdgeInsets)contentInset
{
  _contentInset = contentInset;
  [RCTView autoAdjustInsetsForView:self
                    withScrollView:_webView.scrollView
                      updateOffset:NO];
}

- (void)setScalesPageToFit:(BOOL)scalesPageToFit
{
//  if (_webView.scalesPageToFit != scalesPageToFit) {
//    _webView.scalesPageToFit = scalesPageToFit;
//    [_webView reload];
//  }
  [_webView reload];
}

- (BOOL)scalesPageToFit
{
  return NO;//_webView.scalesPageToFit;
}

- (void)setBackgroundColor:(UIColor *)backgroundColor
{
  CGFloat alpha = CGColorGetAlpha(backgroundColor.CGColor);
  self.opaque = _webView.opaque = (alpha == 1.0);
  _webView.backgroundColor = backgroundColor;
}

- (UIColor *)backgroundColor
{
  return _webView.backgroundColor;
}

- (NSMutableDictionary<NSString *, id> *)baseEvent
{
  NSMutableDictionary<NSString *, id> *event = [[NSMutableDictionary alloc] initWithDictionary:@{
                                                                                                 @"url": _webView.URL.absoluteString ?: @"",
                                                                                                 @"loading" : @(_webView.loading),
                                                                                                 @"title": _webView.title,
                                                                                                 @"canGoBack": @(_webView.canGoBack),
                                                                                                 @"canGoForward" : @(_webView.canGoForward),
                                                                                                 }];
  
  return event;
}

- (void)refreshContentInset
{
  [RCTView autoAdjustInsetsForView:self
                    withScrollView:_webView.scrollView
                      updateOffset:YES];
}

#pragma mark - NJKWebViewProgress methods

- (void)startProgress
{
  if (_progress < WKInitialProgressValue) {
    [self setProgress:WKInitialProgressValue];
  }
}

- (void)incrementProgress
{
  float progress = self.progress;
  float maxProgress = _interactive ? WKFinalProgressValue : WKInteractiveProgressValue;
  float remainPercent = (float)_loadingCount / (float)_maxLoadCount;
  float increment = (maxProgress - progress) * remainPercent;
  progress += increment;
  progress = fmin(progress, maxProgress);
  
  [self setProgress:progress];
}

- (void)completeProgress
{
  [self setProgress:1.0];
  if (_onLoadingFinish) {
    _onLoadingFinish([self baseEvent]);
  }
}

- (void)setProgress:(float)progress
{
  // progress should be incremental only
  if (progress > _progress || progress == 0) {
    _progress = progress;
    if (_onProgressChange) {
      NSMutableDictionary<NSString *, id> *event = [self baseEvent];
      event[@"progress"] = @(progress);
      
      _onProgressChange(event);
    }
  }
}

- (void)reset
{
  _maxLoadCount = _loadingCount = 0;
  _interactive = NO;
  [self setProgress:0.0];
}

#pragma mark - UIWebViewDelegate methods

- (void)webView:(WKWebView *)webView decidePolicyForNavigationAction:(WKNavigationAction *)navigationAction decisionHandler:(void (^)(WKNavigationActionPolicy))decisionHandler{
  NSString *url = navigationAction.request.URL.absoluteString;
  NSLog(@"url is %@",url);
  
  if ([url hasPrefix:@"https://itunes.apple.com/cn/app/"]) {
    [[UIApplication sharedApplication] openURL:navigationAction.request.URL];
    decisionHandler(WKNavigationActionPolicyCancel);
    return;
  }
  
  if ([navigationAction.request.URL.scheme isEqualToString:@"itms-services"]) {
    if ([[UIApplication sharedApplication] canOpenURL:navigationAction.request.URL]) {
      [[UIApplication sharedApplication] openURL:navigationAction.request.URL];
    }
    decisionHandler(WKNavigationActionPolicyCancel);
    return;
  }
  
#pragma mark - zjbpha
  if ([navigationAction.request.URL.path isEqualToString:WK_completeRPCURLPath]) {
    [self completeProgress];
    decisionHandler(WKNavigationActionPolicyCancel);
    return;
  } else {
    BOOL isFragmentJump = NO;
    if (navigationAction.request.URL.fragment) {
      NSString *nonFragmentURL = [navigationAction.request.URL.absoluteString stringByReplacingOccurrencesOfString:[@"#" stringByAppendingString:navigationAction.request.URL.fragment] withString:@""];
      isFragmentJump = [nonFragmentURL isEqualToString:webView.URL.absoluteString];
    }
    
    BOOL isTopLevelNavigation = [navigationAction.request.mainDocumentURL isEqual:navigationAction.request.URL];
    
    BOOL isHTTPOrLocalFile = [navigationAction.request.URL.scheme isEqualToString:@"http"] || [navigationAction.request.URL.scheme isEqualToString:@"https"] || [navigationAction.request.URL.scheme isEqualToString:@"file"];
    if (!isFragmentJump && isHTTPOrLocalFile && isTopLevelNavigation) {
      _currentURL = navigationAction.request.URL;
      [self reset];
    }
    
    NSLog(@"navigationAction.request.URL.scheme is %@",navigationAction.request.URL.scheme);
    BOOL isJSNavigation = NO;//[navigationAction.request.URL.scheme isEqualToString:WKJSNavigationScheme];
    
//    if (isJSNavigation && [navigationAction.request.URL.host isEqualToString:WKJSPostMessageHost]) {
//      NSString *data = navigationAction.request.URL.query;
//      data = [data stringByReplacingOccurrencesOfString:@"+" withString:@" "];
//      data = [data stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
//      
//      NSMutableDictionary<NSString *, id> *event = [self baseEvent];
//      [event addEntriesFromDictionary: @{
//                                         @"data": data,
//                                         }];
//      _onMessage(event);
//      
//    }
    
    if (![url hasPrefix:@"http"]){
      
      decisionHandler(WKNavigationActionPolicyCancel);
      return;
    }
    
    static NSDictionary<NSNumber *, NSString *> *navigationTypes;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
      navigationTypes = @{
                          @(WKNavigationTypeLinkActivated): @"click",
                          @(WKNavigationTypeFormSubmitted): @"formsubmit",
                          @(WKNavigationTypeBackForward): @"backforward",
                          @(WKNavigationTypeReload): @"reload",
                          @(WKNavigationTypeFormResubmitted): @"formresubmit",
                          @(WKNavigationTypeOther): @"other",
                          };
    });
    
    // skip this for the JS Navigation handler
    if (!isJSNavigation && _onShouldStartLoadWithRequest) {
      NSMutableDictionary<NSString *, id> *event = [self baseEvent];
      [event addEntriesFromDictionary: @{
                                         @"url": (navigationAction.request.URL).absoluteString,
                                         @"navigationType": navigationTypes[@(navigationAction.navigationType)]
                                         }];
      if (![self.delegate webView:self
        shouldStartLoadForRequest:event
                     withCallback:_onShouldStartLoadWithRequest]) {
        decisionHandler(WKNavigationActionPolicyCancel);
        return;
      }
    }
    
    if (_onLoadingStart) {
      // We have this check to filter out iframe requests and whatnot
      BOOL isTopFrame = [navigationAction.request.URL isEqual:navigationAction.request.mainDocumentURL];
      if (isTopFrame) {
        NSMutableDictionary<NSString *, id> *event = [self baseEvent];
        [event addEntriesFromDictionary: @{
                                           @"url": (navigationAction.request.URL).absoluteString,
                                           @"navigationType": navigationTypes[@(navigationAction.navigationType)]
                                           }];
        _onLoadingStart(event);
      }
    }
    decisionHandler(!isJSNavigation?WKNavigationActionPolicyAllow:WKNavigationActionPolicyCancel);
  }
}

- (void)webView:(WKWebView *)webView didStartProvisionalNavigation:(WKNavigation *)navigation{
  _loadingCount++;
  _maxLoadCount = fmax(_maxLoadCount, _loadingCount);
  
  [self startProgress];
}

- (void)webView:(WKWebView *)webView didFailProvisionalNavigation:(WKNavigation *)navigation withError:(NSError *)error{
  if (_onLoadingError) {
    if ([error.domain isEqualToString:NSURLErrorDomain] && error.code == NSURLErrorCancelled) {
      // NSURLErrorCancelled is reported when a page has a redirect OR if you load
      // a new URL in the WebView before the previous one came back. We can just
      // ignore these since they aren't real errors.
      // http://stackoverflow.com/questions/1024748/how-do-i-fix-nsurlerrordomain-error-999-in-iphone-3-0-os
      return;
    }
    
    NSMutableDictionary<NSString *, id> *event = [self baseEvent];
    [event addEntriesFromDictionary:@{
                                      @"domain": error.domain,
                                      @"code": @(error.code),
                                      @"description": error.localizedDescription,
                                      }];
    _onLoadingError(event);
  }
#pragma mark - zjbpha
  _loadingCount--;
  [self incrementProgress];
  
  [webView evaluateJavaScript:@"document.readyState" completionHandler:^(id _Nullable back, NSError * _Nullable error) {
    NSString *readyState = back;
    BOOL interactive = [readyState isEqualToString:@"interactive"];
    if (interactive) {
      _interactive = YES;
      NSString *waitForCompleteJS = [NSString stringWithFormat:@"window.addEventListener('load',function() { var iframe = document.createElement('iframe'); iframe.style.display = 'none'; iframe.src = '%@://%@%@'; document.body.appendChild(iframe);  }, false);", webView.URL.scheme, webView.URL.host, WK_completeRPCURLPath];
      [webView evaluateJavaScript:waitForCompleteJS completionHandler:nil];
    }
    
    BOOL isNotRedirect = _currentURL && [_currentURL isEqual:webView.URL];
    BOOL complete = [readyState isEqualToString:@"complete"];
    if ((complete && isNotRedirect) || error) {
      [self completeProgress];
    }
  }];
}

- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation{
  NSLog(@"--------------------------------------------------");
//  [webView evaluateJavaScript:@"document.documentElement.style.webkitTouchCallout='none';" completionHandler:nil];
  if (_messagingEnabled) {
#if RCT_DEV
    // See isNative in lodash
//    NSString *testPostMessageNative = @"String(window.postMessage) === String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage')";
//    
//    
//    [webView evaluateJavaScript:testPostMessageNative completionHandler:^(id _Nullable result, NSError * _Nullable error) {
//      BOOL postMessageIsNative = [
//                                  result
//                                  isEqualToString:@"true"
//                                  ];
//    
//      if (!postMessageIsNative) {
//        RCTLogError(@"Setting onMessage on a WebView overrides existing values of window.postMessage, but a previous value was defined");
//      }
//    }];
    
    
#endif
//    NSString *source = [NSString stringWithFormat:
//                        @"window.originalPostMessage = window.postMessage;"
//                        "window.postMessage = function(data) {"
//                        "window.location = '%@://%@?' + encodeURIComponent(String(data));"
//                        "};", WKJSNavigationScheme, WKJSPostMessageHost
//                        ];
//    NSString *source = @"window.originalPostMessage = window.postMessage;"
//    "window.postMessage = function(data) {"
//    "window.webkit.messageHandlers.Location.postMessage(encodeURIComponent(String(data)));"
//    "};";//
    NSString *source = [NSString stringWithFormat:
                        @"window.originalPostMessage = window.postMessage;"
                        "window.postMessage = function(data) {"
                        "let urlString = '%@://%@?' + encodeURIComponent(String(data));"
                        "window.webkit.messageHandlers.NLocation.postMessage(urlString);"
                        "};", WKJSNavigationScheme, WKJSPostMessageHost
                        ];
    [webView evaluateJavaScript:source completionHandler:nil];
    
  
    
  }
  if (_injectedJavaScript != nil) {
    [webView evaluateJavaScript:_injectedJavaScript completionHandler:^(id _Nullable jsEvaluationValue, NSError * _Nullable error) {
      NSMutableDictionary<NSString *, id> *event = [self baseEvent];
      event[@"jsEvaluationValue"] = jsEvaluationValue;
      NSLog(@"jsEvaluationValue is %@",jsEvaluationValue);
      _onLoadingFinish(event);
    }];
    
    
  }
  // we only need the final 'finishLoad' call so only fire the event when we're actually done loading.
  else if (_onLoadingFinish && !webView.loading && ![webView.URL.absoluteString isEqualToString:@"about:blank"]) {
    _onLoadingFinish([self baseEvent]);
  }
#pragma mark - zjbpha
  _loadingCount--;
  [self incrementProgress];
  
//  NSString *readyState = [webView stringByEvaluatingJavaScriptFromString:@"document.readyState"];
  
  [webView evaluateJavaScript:@"document.readyState" completionHandler:^(id _Nullable readyState, NSError * _Nullable error) {
    BOOL interactive = [readyState isEqualToString:@"interactive"];
    if (interactive) {
      _interactive = YES;
      NSString *waitForCompleteJS = [NSString stringWithFormat:@"window.addEventListener('load',function() { var iframe = document.createElement('iframe'); iframe.style.display = 'none'; iframe.src = '%@://%@%@'; document.body.appendChild(iframe);  }, false);", webView.URL.scheme, webView.URL.host, WK_completeRPCURLPath];
      [webView evaluateJavaScript:waitForCompleteJS completionHandler:nil];
    }
    
    BOOL isNotRedirect = _currentURL && [_currentURL isEqual:webView.URL];
    BOOL complete = [readyState isEqualToString:@"complete"];
    if (complete && isNotRedirect) {
      [self completeProgress];
    }
  }];
  
  {
    NSString *JS = @"(function(){\
        var videos = document.getElementsByTagName('video');\
        window.webkit.messageHandlers.NativeLog.postMessage( 'videos length :' + videos.length);\
        window.webkit.messageHandlers.NativeLog.postMessage( 'window host :' + window.location.host);\
        if (0){\
          window.webkit.messageHandlers.NativeLog.postMessage('->enter');\
          var childNodes= [];\
          try {\
            childNodes = document.getElementsByClassName('txp_video_container')[0].childNodes;\
          } catch (error) {\
            window.webkit.messageHandlers.NativeLog.postMessage('->error');\
          }\
          window.webkit.messageHandlers.NativeLog.postMessage(childNodes.length);\
          var url = childNodes[1].src;\
          window.webkit.messageHandlers.NativeLog.postMessage('video_url://' + url);\
        } else {\
          for (var num = 0; num < videos.length; num ++){\
          let element = videos[num];\
          element.autoplay = 'none';\
          window.webkit.messageHandlers.NativeLog.postMessage('->start');\
          window.webkit.messageHandlers.NativeLog.postMessage(element.id + '');\
          if (element.id.indexOf('tenvideo_video_player_0') < 0) {\
            window.webkit.messageHandlers.NativeLog.postMessage('add listen');\
            if (element.betaged == 1) continue;\
            element.betaged = 1;\
            element.addEventListener('loadstart',function(){\
              window.webkit.messageHandlers.NativeLog.postMessage(element.src);\
              if (element.src.indexOf('null') > 0 ){ return;}\
              video_action(element);\
          },false);\
            window.webkit.messageHandlers.NativeLog.postMessage('end');\
          }\
        }\
      }\
      function video_action(element) {\
          var videoUrl = 'video_url://';\
          let host = document.location.host + '';\
          window.webkit.messageHandlers.NativeLog.postMessage('host:' + host);\
          if (host.indexOf('bilibili.com') >=0) {\
            var sub_nodes = element.childNodes;\
            window.webkit.messageHandlers.NativeLog.postMessage('sub_nodes:' + sub_nodes.length);\
            var sub_url = '';\
            for (let sub_num = 0; sub_num < sub_nodes.length;sub_num++){\
              window.webkit.messageHandlers.NativeLog.postMessage('sub_nodes:' + sub_nodes[sub_num].src);\
              let _url = sub_nodes[sub_num].src;\
              if (_url !== null || _url !== undefined || _url !== '') {\
                  sub_url = _url; break;\
              }\
            }\
            videoUrl = 'video_url://' + sub_url;\
            } else {\
            videoUrl = 'video_url://' + element.src;\
          }\
          window.webkit.messageHandlers.NativeMethod.postMessage(videoUrl);\
          element.preload = 'none';\
          element.pause();\
          element.src = 'null';\
          element.autoplay = 'none';\
          element.style.display = 'none';\
    }\
    })();";
    
    [webView evaluateJavaScript:JS completionHandler:nil];
  }
//  
  
  
  
  
  
  
}

-(WKWebView *)webView:(WKWebView *)webView createWebViewWithConfiguration:(WKWebViewConfiguration *)configuration forNavigationAction:(WKNavigationAction *)navigationAction windowFeatures:(WKWindowFeatures *)windowFeatures
{
  NSLog(@"createWebViewWithConfiguration");
  if (!navigationAction.targetFrame.isMainFrame) {
    [webView loadRequest:navigationAction.request];
  }
  return nil;
}


- (void)windowBecameHidden:(NSNotification *)notification {
  
  UIWindow *window = notification.object;
  NSString *windowclass = [NSString stringWithFormat:@"%@",window.class];
  if (window != [UIApplication sharedApplication].keyWindow&&
      ![windowclass isEqualToString:@"UITextEffectsWindow"]&&
      ![windowclass isEqualToString:@"UIRemoteKeyboardWindow"]) {
    NSLog(@"Online video on full screen.");
    
    NSString *videoHandlerString =
    [[NSBundle mainBundle] pathForResource:@"videopause" ofType:@"js"];
    if (videoHandlerString) {
      [_webView evaluateJavaScript:videoHandlerString completionHandler:nil];
    }
    
    
    
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
      UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"提示" message:@"iOS版本视频暂不支持免流量，是否继续?" preferredStyle:UIAlertControllerStyleAlert];
      UIAlertAction *cancelAction = [UIAlertAction actionWithTitle:@"取消" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        //        dispatch_semaphore_signal(sema);
      }];
      UIAlertAction *confirmAction = [UIAlertAction actionWithTitle:@"确定" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        //        dispatch_semaphore_signal(sema);
      }];
      [alert addAction:cancelAction];
      [alert addAction:confirmAction];
      
      [window.rootViewController presentViewController:alert animated:YES completion:nil];
      
    });
    
  }
}




- (M3U8ParseDomain *)m3u8_parse_domain{
  if (!_m3u8_parse_domain) {
    _m3u8_parse_domain = [[M3U8ParseDomain alloc]init];
  }
  return _m3u8_parse_domain;
}

- (NSTimer *)txtimer{
  if (!_txtimer) {
    _txtimer = [NSTimer timerWithTimeInterval:1 target:self selector:@selector(timeSelector) userInfo:nil repeats:NO];
    [[NSRunLoop currentRunLoop] addTimer:_txtimer forMode:NSRunLoopCommonModes];
    
  }
  return _txtimer;
}

- (void)timeSelector{
  NSLog(@"fire*****************");
  NSLog(@"__________%@",_TXPlayLists);
  NSString *remote_url = [_TXPlayLists.lastObject copy];
  [self callvideoInUrl:remote_url];
  [_TXPlayLists removeAllObjects];
  [_txtimer invalidate];
  _txtimer = nil;
}

- (void)callvideoInUrl:(NSString *)urlString{
  
  dispatch_async(dispatch_get_main_queue(), ^{
    NSURL *url = [NSURL URLWithString:urlString];
    UIView *view = [UIApplication sharedApplication].keyWindow.rootViewController.view;
    [[TBPlayer sharedInstance] playWithUrl:url showView:view];
  });
  
}

- (void)anotherMethod_download_m3u8:(NSString *)urlString{
  
  
  NSURLSession *session = [NSURLSession sharedSession];
  NSURL *url = [NSURL URLWithString:urlString];
  
  NSURLSessionTask *task = [session downloadTaskWithURL:url
                                      completionHandler:^(NSURL * _Nullable location, NSURLResponse * _Nullable response, NSError * _Nullable error) {
                                        BOOL res = [self.m3u8_parse_domain parse_m3u8_by_add_local_domain_with_v2_Path:location.path];
                                        if (res) {
                                          NSString *path = nil;
                                          path = [[NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, true) firstObject] stringByAppendingPathComponent:new_file_name];
                                          NSString *domain = @"http://127.0.0.1:12345/";
                                          domain = [domain stringByAppendingString:new_file_name];
                                          
                                          [self callvideoInUrl:domain];
                                          
                                          
                                        }
                                      }];
  
  [task resume];
  
}





@end
