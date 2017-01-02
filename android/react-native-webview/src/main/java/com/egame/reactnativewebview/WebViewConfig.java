package com.egame.reactnativewebview;


import com.tencent.smtt.sdk.WebView;

/**
 * Implement this interface in order to config your {@link WebView}. An instance of that
 * implementation will have to be given as a constructor argument to {@link ReactWebViewManager}.
 */
public interface WebViewConfig {

    void configWebView(WebView webView);
}
