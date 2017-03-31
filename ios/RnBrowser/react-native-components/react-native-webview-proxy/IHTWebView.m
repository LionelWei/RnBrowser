//
//  IHTWebView.m
//  RnBrowser
//
//  Created by AZoo on 11/01/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import "IHTWebView.h"

#import <UIKit/UIKit.h>

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

NSString *completeRPCURLPath = @"/njkwebviewprogressproxy/complete";

NSString *const IHTJSNavigationScheme = @"react-js-navigation";
NSString *const IHTJSPostMessageHost = @"postMessage";

NSString *const VideoHandlerScheme = @"videohandler://";

const float NJKInitialProgressValue = 0.1f;
const float NJKInteractiveProgressValue = 0.5f;
const float NJKFinalProgressValue = 0.9f;

@interface IHTWebView () <UIWebViewDelegate, RCTAutoInsetsProtocol>

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

@implementation IHTWebView
{
  UIWebView *_webView;
  NSString *_injectedJavaScript;
  
  NSUInteger _loadingCount;
  NSUInteger _maxLoadCount;
  NSURL *_currentURL;
  BOOL _interactive;
}

- (void)dealloc
{
  _webView.delegate = nil;
//  [[NSNotificationCenter defaultCenter] removeObserver:self];
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
    _webView = [[UIWebView alloc] initWithFrame:self.bounds];
    _webView.delegate = self;
    _webView.allowsInlineMediaPlayback = YES;
    [self addSubview:_webView];
    
//    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(windowBecameHidden:) name:UIWindowDidBecomeVisibleNotification object:nil];
    
//    [[NSNotificationCenter defaultCenter] addObserver:self
//                                             selector:@selector(playbackDidEnd:)
//                                                 name:@"MPAVControllerPlaybackStateChangedNotification"
//                                                      //@"MPAVControllerItemPlaybackDidEndNotification"
//                                                      //@"MPAVControllerPlaybackStateChangedNotification"
//                                               object:nil];
    
  }
  return self;
}

//- (void)playbackDidEnd:(NSNotification *)note
//{
//  //do your stuff here
//  if (note) {
//    
//  }
//}

RCT_NOT_IMPLEMENTED(- (instancetype)initWithCoder:(NSCoder *)aDecoder)

- (void)goForward
{
  [_webView goForward];
}

- (void)goBack
{
  [_webView goBack];
}

- (void)reload
{
  NSURLRequest *request = [RCTConvert NSURLRequest:self.source];
  if (request.URL && !_webView.request.URL.absoluteString.length) {
    [_webView loadRequest:request];
  }
  else {
    [_webView reload];
  }
}

- (void)stopLoading
{
  [_webView stopLoading];
}

- (void)postMessage:(NSString *)message
{
  NSDictionary *eventInitDict = @{
                                  @"data": message,
                                  };
  NSString *source = [NSString
                      stringWithFormat:@"document.dispatchEvent(new MessageEvent('message', %@));",
                      RCTJSONStringify(eventInitDict, NULL)
                      ];
  [_webView stringByEvaluatingJavaScriptFromString:source];
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
    if ([request.URL isEqual:_webView.request.URL]) {
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
  if (_webView.scalesPageToFit != scalesPageToFit) {
    _webView.scalesPageToFit = scalesPageToFit;
    [_webView reload];
  }
}

- (BOOL)scalesPageToFit
{
  return _webView.scalesPageToFit;
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
                                                                                                 @"url": _webView.request.URL.absoluteString ?: @"",
                                                                                                 @"loading" : @(_webView.loading),
                                                                                                 @"title": [_webView stringByEvaluatingJavaScriptFromString:@"document.title"],
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
  if (_progress < NJKInitialProgressValue) {
    [self setProgress:NJKInitialProgressValue];
  }
}

- (void)incrementProgress
{
  float progress = self.progress;
  float maxProgress = _interactive ? NJKFinalProgressValue : NJKInteractiveProgressValue;
  float remainPercent = (float)_loadingCount / (float)_maxLoadCount;
  float increment = (maxProgress - progress) * remainPercent;
  progress += increment;
  progress = fmin(progress, maxProgress);
  [self setProgress:progress];
}

- (void)completeProgress
{
  [self setProgress:1.0];
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
  
  NSLog(@"========> %f",progress);
}

- (void)reset
{
  _maxLoadCount = _loadingCount = 0;
  _interactive = NO;
  [self setProgress:0.0];
}

#pragma mark - UIWebViewDelegate methods

- (BOOL)webView:(__unused UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request
 navigationType:(UIWebViewNavigationType)navigationType
{
//  if ([request.URL.absoluteString hasPrefix:@"wvjbscheme://"]) {
//    return NO;
//  }
  
  if ([request.URL.absoluteString hasPrefix:@"https://itunes.apple.com/cn/app/"]) {
    [[UIApplication sharedApplication] openURL:request.URL];
    return NO;
  }
  
  if (![request.URL.absoluteString hasPrefix:@"http"]) {
    return NO;
  }

  
  NSLog(@"------>%@", request.URL);
//  if ([request.URL.scheme isEqualToString:VideoHandlerScheme]) {
//    NSLog(@"------>%@", request.URL);//在这里可以获得事件
//    return NO;
//  }
  
#pragma mark - zjbpha
  if ([request.URL.path isEqualToString:completeRPCURLPath]) {
    [self completeProgress];
    return NO;
  }
  
  BOOL isFragmentJump = NO;
  if (request.URL.fragment) {
    NSString *nonFragmentURL = [request.URL.absoluteString stringByReplacingOccurrencesOfString:[@"#" stringByAppendingString:request.URL.fragment] withString:@""];
    isFragmentJump = [nonFragmentURL isEqualToString:webView.request.URL.absoluteString];
  }
  
  BOOL isTopLevelNavigation = [request.mainDocumentURL isEqual:request.URL];
  
  BOOL isHTTPOrLocalFile = [request.URL.scheme isEqualToString:@"http"] || [request.URL.scheme isEqualToString:@"https"] || [request.URL.scheme isEqualToString:@"file"];
  if (!isFragmentJump && isHTTPOrLocalFile && isTopLevelNavigation) {
    _currentURL = request.URL;
    [self reset];
  }
  
  
  BOOL isJSNavigation = [request.URL.scheme isEqualToString:IHTJSNavigationScheme];
  
  static NSDictionary<NSNumber *, NSString *> *navigationTypes;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    navigationTypes = @{
                        @(UIWebViewNavigationTypeLinkClicked): @"click",
                        @(UIWebViewNavigationTypeFormSubmitted): @"formsubmit",
                        @(UIWebViewNavigationTypeBackForward): @"backforward",
                        @(UIWebViewNavigationTypeReload): @"reload",
                        @(UIWebViewNavigationTypeFormResubmitted): @"formresubmit",
                        @(UIWebViewNavigationTypeOther): @"other",
                        };
  });
  
  // skip this for the JS Navigation handler
  if (!isJSNavigation && _onShouldStartLoadWithRequest) {
    NSMutableDictionary<NSString *, id> *event = [self baseEvent];
    [event addEntriesFromDictionary: @{
                                       @"url": (request.URL).absoluteString,
                                       @"navigationType": navigationTypes[@(navigationType)]
                                       }];
    if (![self.delegate webView:self
      shouldStartLoadForRequest:event
                   withCallback:_onShouldStartLoadWithRequest]) {
      return NO;
    }
  }
  
  if (_onLoadingStart) {
    // We have this check to filter out iframe requests and whatnot
    BOOL isTopFrame = [request.URL isEqual:request.mainDocumentURL];
    if (isTopFrame) {
      NSMutableDictionary<NSString *, id> *event = [self baseEvent];
      [event addEntriesFromDictionary: @{
                                         @"url": (request.URL).absoluteString,
                                         @"navigationType": navigationTypes[@(navigationType)]
                                         }];
      _onLoadingStart(event);
    }
  }
  
  if (isJSNavigation && [request.URL.host isEqualToString:IHTJSPostMessageHost]) {
    NSString *data = request.URL.query;
    data = [data stringByReplacingOccurrencesOfString:@"+" withString:@" "];
    data = [data stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
    
    NSMutableDictionary<NSString *, id> *event = [self baseEvent];
    [event addEntriesFromDictionary: @{
                                       @"data": data,
                                       }];
    _onMessage(event);
  }
  
  
  // JS Navigation handler
  return !isJSNavigation;
}

- (void)webViewDidStartLoad:(UIWebView *)webView
{
  
//  JSContext *context = [_webView valueForKeyPath:@"documentView.webView.mainFrame.javaScriptContext"];
//  context[@"userPlayVideo"] = ^() {
//    NSArray *args = [JSContext currentArguments];
//    for (JSValue *jsVal in args) {
//      NSLog(@"%@", jsVal);
//    }
//    JSValue *this = [JSContext currentThis];
//    NSLog(@"this: %@",this);
//  };
  
  _loadingCount++;
  _maxLoadCount = fmax(_maxLoadCount, _loadingCount);
  
  [self startProgress];
}

- (void)webView:(__unused UIWebView *)webView didFailLoadWithError:(NSError *)error
{
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
  
  NSString *readyState = [webView stringByEvaluatingJavaScriptFromString:@"document.readyState"];
  
  BOOL interactive = [readyState isEqualToString:@"interactive"];
  if (interactive) {
    _interactive = YES;
    NSString *waitForCompleteJS = [NSString stringWithFormat:@"window.addEventListener('load',function() { var iframe = document.createElement('iframe'); iframe.style.display = 'none'; iframe.src = '%@://%@%@'; document.body.appendChild(iframe);  }, false);", webView.request.mainDocumentURL.scheme, webView.request.mainDocumentURL.host, completeRPCURLPath];
    [webView stringByEvaluatingJavaScriptFromString:waitForCompleteJS];
  }
  
  BOOL isNotRedirect = _currentURL && [_currentURL isEqual:webView.request.mainDocumentURL];
  BOOL complete = [readyState isEqualToString:@"complete"];
  if ((complete && isNotRedirect) || error) {
    [self completeProgress];
  }
  
}

- (void)webViewDidFinishLoad:(UIWebView *)webView
{
  if (_messagingEnabled) {
#if RCT_DEV
    // See isNative in lodash
    NSString *testPostMessageNative = @"String(window.postMessage) === String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage')";
    BOOL postMessageIsNative = [
                                [webView stringByEvaluatingJavaScriptFromString:testPostMessageNative]
                                isEqualToString:@"true"
                                ];
    if (!postMessageIsNative) {
      RCTLogError(@"Setting onMessage on a WebView overrides existing values of window.postMessage, but a previous value was defined");
    }
#endif
    NSString *source = [NSString stringWithFormat:
                        @"window.originalPostMessage = window.postMessage;"
                        "window.postMessage = function(data) {"
                        "window.location = '%@://%@?' + encodeURIComponent(String(data));"
                        "};", IHTJSNavigationScheme, IHTJSPostMessageHost
                        ];
    [webView stringByEvaluatingJavaScriptFromString:source];
  }
  if (_injectedJavaScript != nil) {
    NSString *jsEvaluationValue = [webView stringByEvaluatingJavaScriptFromString:_injectedJavaScript];
    
    NSMutableDictionary<NSString *, id> *event = [self baseEvent];
    event[@"jsEvaluationValue"] = jsEvaluationValue;
    
    _onLoadingFinish(event);
  }
  // we only need the final 'finishLoad' call so only fire the event when we're actually done loading.
  else if (_onLoadingFinish && !webView.loading && ![webView.request.URL.absoluteString isEqualToString:@"about:blank"]) {
    _onLoadingFinish([self baseEvent]);
  }
#pragma mark - zjbpha
  _loadingCount--;
  [self incrementProgress];
  
  NSString *readyState = [webView stringByEvaluatingJavaScriptFromString:@"document.readyState"];
  
  BOOL interactive = [readyState isEqualToString:@"interactive"];
  if (interactive) {
    _interactive = YES;
    NSString *waitForCompleteJS = [NSString stringWithFormat:@"window.addEventListener('load',function() { var iframe = document.createElement('iframe'); iframe.style.display = 'none'; iframe.src = '%@://%@%@'; document.body.appendChild(iframe);  }, false);", webView.request.mainDocumentURL.scheme, webView.request.mainDocumentURL.host, completeRPCURLPath];
    [webView stringByEvaluatingJavaScriptFromString:waitForCompleteJS];
  }
  
  BOOL isNotRedirect = _currentURL && [_currentURL isEqual:webView.request.mainDocumentURL];
  BOOL complete = [readyState isEqualToString:@"complete"];
  if (complete && isNotRedirect) {
    [self completeProgress];
  }
  
  [self videoCatchFromWeb:webView];
  
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
      [_webView stringByEvaluatingJavaScriptFromString:videoHandlerString];
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
    
//    dispatch_semaphore_wait(sema, DISPATCH_TIME_FOREVER);
    
  }
}

- (void)videoCatchFromWeb:(UIWebView *)webView{
  JSContext *context=[webView valueForKeyPath:@"documentView.webView.mainFrame.javaScriptContext"];
  
  context[@"logNative"] = ^(){
    NSArray *args = [JSContext currentArguments];
    for (id obj in args) {
      NSLog(@"-------->%@",obj);
    }
  };
  
  context[@"video_url"] = ^(){
    NSArray *args = [JSContext currentArguments];
    for (id obj in args) {
      NSLog(@"-------->%@",obj);
      //ba
      NSString *urlString = [NSString stringWithFormat:@"%@",obj];
      if ([urlString rangeOfString:@"qq.com"].location != NSNotFound) {
        [_TXPlayLists addObject:urlString];
        if ([self.txtimer isValid]) {
          [self.txtimer invalidate];
          self.txtimer = nil;
        }
        [self.txtimer isValid];
      } else {
        [self anotherMethod_download_m3u8:urlString];
      }
      
      break;
    }
  };
  
  
  
  NSString *js = @"(function(){\
  var videos = document.getElementsByTagName('video');\
  for (var num = 0; num < videos.length; num ++){\
  let element = videos[num];\
  if (element.betaged == 1) continue;\
  element.betaged = 1;\
  element.addEventListener('loadstart',function(){\
  video_action(element);\
  },false);\
  }\
  function video_action(element) {\
  if (element.src.indexOf('null') >= 0) return;\
  logNative('****************');\
  video_url(element.src);\
  element.preload = 'none';\
  element.pause();\
  element.src = null;\
  element.autoplay = 'none';\
  element.style.display = 'none';\
  }\
  })();";
  
  
  [webView stringByEvaluatingJavaScriptFromString:js];
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

- (void)callvideoInUrl:(NSString *)urlString{
  
  dispatch_async(dispatch_get_main_queue(), ^{
    NSURL *url = [NSURL URLWithString:urlString];
    UIView *view = [UIApplication sharedApplication].keyWindow.rootViewController.view;
    [[TBPlayer sharedInstance] playWithUrl:url showView:view];
  });

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

@end
