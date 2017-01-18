package com.egame.reactnativewebview;

import android.annotation.TargetApi;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Picture;
import android.os.Build;
import android.preference.PreferenceManager;
import android.text.TextUtils;
import android.util.Log;
import android.view.ViewGroup.LayoutParams;
import android.webkit.DownloadListener;
import android.webkit.HttpAuthHandler;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.egame.reactnativewebview.eventbus.ProxyAsPerNetworkEvent;
import com.egame.reactnativewebview.eventbus.ProxyConfigUpdateEvent;
import com.egame.reactnativewebview.events.StartDownloadEvent;
import com.egame.reactnativewebview.events.TopLoadingErrorEvent;
import com.egame.reactnativewebview.events.TopLoadingFinishEvent;
import com.egame.reactnativewebview.events.TopLoadingStartEvent;
import com.egame.reactnativewebview.events.TopMessageEvent;
import com.egame.reactnativewebview.events.UpdateLoadingProgressEvent;
import com.facebook.common.logging.FLog;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.common.ReactConstants;
import com.facebook.react.common.build.ReactBuildConfig;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.ContentSizeChangeEvent;
import com.facebook.react.uimanager.events.Event;
import com.facebook.react.uimanager.events.EventDispatcher;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import javax.annotation.Nullable;

/**
 * Manages instances of {@link WebView}
 *
 * Can accept following commands:
 *  - GO_BACK
 *  - GO_FORWARD
 *  - RELOAD
 *
 * {@link WebView} instances could emit following direct events:
 *  - topLoadingFinish
 *  - topLoadingStart
 *  - topLoadingError
 *
 * Each event will carry the following properties:
 *  - target - view's react tag
 *  - url - url set for the webview
 *  - loading - whether webview is in a loading state
 *  - title - title of the current page
 *  - canGoBack - boolean, whether there is anything on a history stack to go back
 *  - canGoForward - boolean, whether it is possible to request GO_FORWARD command
 */
@ReactModule(name = NativeWebViewManager.REACT_CLASS)
public class NativeWebViewManager extends SimpleViewManager<WebView> {

    protected static final String REACT_CLASS = "WebViewAndroid";
    private static final String TAG = REACT_CLASS;

    private static final int API = android.os.Build.VERSION.SDK_INT;
    private static final String HTML_ENCODING = "UTF-8";
    private static final String HTML_MIME_TYPE = "text/html; charset=utf-8";
    private static final String BRIDGE_NAME = "__REACT_WEB_VIEW_ANDROID_BRIDGE";

    private static final String HTTP_METHOD_POST = "POST";

    public static final int COMMAND_GO_BACK = 1;
    public static final int COMMAND_GO_FORWARD = 2;
    public static final int COMMAND_RELOAD = 3;
    public static final int COMMAND_STOP_LOADING = 4;
    public static final int COMMAND_POST_MESSAGE = 5;

    // Use `webView.loadUrl("about:blank")` to reliably reset the view
    // state and release page resources (including any running JavaScript).
    private static final String BLANK_URL = "about:blank";

    private ReactContext mReactContext;
    private WebViewConfig mWebViewConfig;
    private WebView mWebView;
    private @Nullable WebView.PictureListener mPictureListener;

    private class ReactWebViewClient extends WebViewClient {

        private boolean mLastLoadFailed = false;

        @Override
        public void onPageFinished(WebView webView, String url) {
            super.onPageFinished(webView, url);

            if (!mLastLoadFailed) {
                NativeWebViewManager.ReactWebView reactWebView = (NativeWebViewManager.ReactWebView) webView;
                reactWebView.callInjectedJavaScript();
                reactWebView.linkBridge();
                emitFinishEvent(webView, url);
            }
        }

        @Override
        public void onPageStarted(WebView webView, String url, Bitmap favicon) {
            super.onPageStarted(webView, url, favicon);
            mLastLoadFailed = false;
            dispatchEvent(
                    webView,
                    new TopLoadingStartEvent(
                            webView.getId(),
                            createWebViewEvent(webView, url)));
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            return false;
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            Log.e(REACT_CLASS, "shouldOverrideUrlLoading: " + url);
            return false;
            // Url of taobao is prefixed with 'taobao://', which cannot match rules as below.
/*
            if (url.startsWith("http://") || url.startsWith("https://") ||
                    url.startsWith("file://")) {
                return false;
            } else {
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                view.getContext().startActivity(intent);
                return true;
            }
*/
        }

        @Override
        public void onReceivedError(
                WebView webView,
                int errorCode,
                String description,
                String failingUrl) {
            super.onReceivedError(webView, errorCode, description, failingUrl);
            mLastLoadFailed = true;

            // In case of an error JS side expect to get a finish event first, and then get an error event
            // Android WebView does it in the opposite way, so we need to simulate that behavior

//            emitFinishEvent(webView, failingUrl);

            WritableMap eventData = createWebViewEvent(webView, failingUrl);
            eventData.putDouble("code", errorCode);
            eventData.putString("description", description);

            dispatchEvent(
                    webView,
                    new TopLoadingErrorEvent(webView.getId(), eventData));
        }

        @Override
        public void doUpdateVisitedHistory(WebView webView, String url, boolean isReload) {
            super.doUpdateVisitedHistory(webView, url, isReload);

            dispatchEvent(
                    webView,
                    new TopLoadingStartEvent(
                            webView.getId(),
                            createWebViewEvent(webView, url)));
        }

        @Override
        public void onReceivedHttpAuthRequest(WebView webView, HttpAuthHandler httpAuthHandler, String host, String realm) {
            Log.e(TAG, "onReceivedHttpAuthRequest: host: " + host + ", realm: " + realm);
            httpAuthHandler.proceed("hanwei", "hw1226qaz");
//            super.onReceivedHttpAuthRequest(webView, httpAuthHandler, s, s1);
        }

        private void emitFinishEvent(WebView webView, String url) {
            dispatchEvent(
                    webView,
                    new TopLoadingFinishEvent(
                            webView.getId(),
                            createWebViewEvent(webView, url)));
        }

        private WritableMap createWebViewEvent(WebView webView, String url) {
            WritableMap event = Arguments.createMap();
            event.putDouble("target", webView.getId());
            // Don't use webView.getUrl() here, the URL isn't updated to the new value yet in callbacks
            // like onPageFinished
            event.putString("url", url);
            event.putBoolean("loading", !mLastLoadFailed && webView.getProgress() != 100);
            event.putString("title", webView.getTitle());
            event.putBoolean("canGoBack", webView.canGoBack());
            event.putBoolean("canGoForward", webView.canGoForward());
            return event;
        }

    }

    private class ReactWebChromeClient extends WebChromeClient {
        @Override
        public void onProgressChanged(WebView webView, int progress) {
            Log.e(TAG, "onProgressChanged: " + progress);
            dispatchEvent(
                    webView,
                    new UpdateLoadingProgressEvent(
                            webView.getId(),
                            createProgressEvent(progress)));
        }

        private WritableMap createProgressEvent(int progress) {
            WritableMap event = Arguments.createMap();
            event.putDouble("progress", progress);
            return event;
        }
    }

    /**
     * Subclass of {@link WebView} that implements {@link LifecycleEventListener} interface in order
     * to call {@link WebView#destroy} on activty destroy event and also to clear the client
     */
    private class ReactWebView extends WebView implements LifecycleEventListener {
        private @Nullable String injectedJS;
        private boolean messagingEnabled = false;
        private boolean mIsProxyEnabled;
        private String mProxyIp;
        private int mProxyPort;

        private class ReactWebViewBridge {
            NativeWebViewManager.ReactWebView mContext;

            ReactWebViewBridge(NativeWebViewManager.ReactWebView c) {
                mContext = c;
            }

            @JavascriptInterface
            public void postMessage(String message) {
                mContext.onMessage(message);
            }
        }

        /**
         * WebView must be created with an context of the current activity
         *
         * Activity Context is required for creation of dialogs internally by WebView
         * Reactive Native needed for access to ReactNative internal system functionality
         *
         */
        public ReactWebView(ThemedReactContext reactContext) {
            super(reactContext.getCurrentActivity());
        }

        @Override
        protected void onAttachedToWindow() {
            super.onAttachedToWindow();
            Log.e(TAG, "onAttachedToWindow: ");
            EventBus.getDefault().register(this);
        }

        @Override
        protected void onDetachedFromWindow() {
            super.onDetachedFromWindow();
            Log.e(TAG, "onDetachedFromWindow: ");
            EventBus.getDefault().unregister(this);
        }

        @Override
        public void onHostResume() {
            // do nothing
        }


        @Override
        public void onHostPause() {
            // do nothing
        }

        @Subscribe
        public void onProxyConfigUpdate(ProxyConfigUpdateEvent event) {
            mIsProxyEnabled = event.isProxyEnabled;
            mProxyIp = event.proxyIp;
            mProxyPort = event.proxyPort;
            if (mIsProxyEnabled) {
                NativeWebViewProxySetting.setProxy(this, mProxyIp, mProxyPort);
            } else {
                NativeWebViewProxySetting.revertBackProxy(this);
            }
        }

        @Subscribe
        public void onNetworkStateUpdate(ProxyAsPerNetworkEvent event) {
            if (mIsProxyEnabled) {
                NativeWebViewProxySetting.setProxy(this, mProxyIp, mProxyPort);
            } else {
                NativeWebViewProxySetting.revertBackProxy(this);
            }
        }

        @Override
        public void onHostDestroy() {
            cleanupCallbacksAndDestroy();
        }

        public void setInjectedJavaScript(@Nullable String js) {
            injectedJS = js;
        }

        public void setMessagingEnabled(boolean enabled) {
            if (messagingEnabled == enabled) {
                return;
            }

            messagingEnabled = enabled;
            if (enabled) {
                addJavascriptInterface(new NativeWebViewManager.ReactWebView.ReactWebViewBridge(this), BRIDGE_NAME);
                linkBridge();
            } else {
                removeJavascriptInterface(BRIDGE_NAME);
            }
        }

        public void callInjectedJavaScript() {
            if (getSettings().getJavaScriptEnabled() &&
                    injectedJS != null &&
                    !TextUtils.isEmpty(injectedJS)) {
                loadUrl("javascript:(function() {\n" + injectedJS + ";\n})();");
            }
        }

        public void linkBridge() {
            if (messagingEnabled) {
                if (ReactBuildConfig.DEBUG && Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                    // See isNative in lodash
                    String testPostMessageNative = "String(window.postMessage) === String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage')";
                    evaluateJavascript(testPostMessageNative, new ValueCallback<String>() {
                        @Override
                        public void onReceiveValue(String value) {
                            if (value.equals("true")) {
                                FLog.w(ReactConstants.TAG, "Setting onMessage on a WebView overrides existing values of window.postMessage, but a previous value was defined");
                            }
                        }
                    });
                }

                loadUrl("javascript:(" +
                        "window.originalPostMessage = window.postMessage," +
                        "window.postMessage = function(data) {" +
                        BRIDGE_NAME + ".postMessage(String(data));" +
                        "}" +
                        ")");
            }
        }

        public void onMessage(String message) {
            dispatchEvent(this, new TopMessageEvent(this.getId(), message));
        }

        private void cleanupCallbacksAndDestroy() {
            setWebViewClient(null);
            destroy();
        }
    }

    private class WebViewDownloadListener implements DownloadListener {
        private final static String TAG = "WebViewDownloadListener";
        private final WebView mWebView;

        public WebViewDownloadListener(WebView webView) {
            mWebView = webView;
        }

        @Override
        public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
            Log.e(TAG, "onDownloadStart: url: " + url);

            String title = URLUtil.guessFileName(url, contentDisposition, mimeType);
            dispatchEvent(
                    mWebView,
                    new StartDownloadEvent(
                            mWebView.getId(),
                            createStartDownloadEvent(mWebView, title, url)));
        }

        private WritableMap createStartDownloadEvent(WebView webView, String title, String url) {
            WritableMap event = Arguments.createMap();
            event.putDouble("target", webView.getId());
            event.putString("url", url);
            event.putString("title", title);
            return event;
        }

    }

    public NativeWebViewManager() {
    }


    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected WebView createViewInstance(ThemedReactContext reactContext) {
        Log.d(REACT_CLASS, "createViewInstance: ");
        NativeWebViewManager.ReactWebView webView = new NativeWebViewManager.ReactWebView(reactContext);
        mReactContext = reactContext;
        mWebView = webView;

        webView.setScrollbarFadingEnabled(false);
        webView.setWebChromeClient(new ReactWebChromeClient());
        reactContext.addLifecycleEventListener(webView);
        initWebSettings(webView);
        // Fixes broken full-screen modals/galleries due to body height being 0.
        webView.setLayoutParams(
                new LayoutParams(LayoutParams.MATCH_PARENT,
                        LayoutParams.MATCH_PARENT));

        if (ReactBuildConfig.DEBUG && Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        webView.setDownloadListener(new WebViewDownloadListener(webView));

        return mWebView;
    }

    @ReactProp(name = "javaScriptEnabled")
    public void setJavaScriptEnabled(WebView view, boolean enabled) {
        view.getSettings().setJavaScriptEnabled(enabled);
    }

    @ReactProp(name = "scalesPageToFit")
    public void setScalesPageToFit(WebView view, boolean enabled) {
        view.getSettings().setUseWideViewPort(!enabled);
    }

    @ReactProp(name = "domStorageEnabled")
    public void setDomStorageEnabled(WebView view, boolean enabled) {
        view.getSettings().setDomStorageEnabled(enabled);
    }

    @ReactProp(name = "userAgent")
    public void setUserAgent(WebView view, @Nullable String userAgent) {
        if (userAgent != null) {
            // TODO(8496850): Fix incorrect behavior when property is unset (uA == null)
            view.getSettings().setUserAgentString(userAgent);
        }
    }

    @TargetApi(17)
    @ReactProp(name = "mediaPlaybackRequiresUserAction")
    public void setMediaPlaybackRequiresUserAction(WebView view, boolean requires) {
        view.getSettings().setMediaPlaybackRequiresUserGesture(requires);
    }

    @ReactProp(name = "injectedJavaScript")
    public void setInjectedJavaScript(WebView view, @Nullable String injectedJavaScript) {
        ((NativeWebViewManager.ReactWebView) view).setInjectedJavaScript(injectedJavaScript);
    }

    @ReactProp(name = "messagingEnabled")
    public void setMessagingEnabled(WebView view, boolean enabled) {
        ((NativeWebViewManager.ReactWebView) view).setMessagingEnabled(enabled);
    }

    @ReactProp(name = "source")
    public void setSource(WebView view, @Nullable ReadableMap source) {
        if (source != null) {
            if (source.hasKey("html")) {
                String html = source.getString("html");
                if (source.hasKey("baseUrl")) {
                    view.loadDataWithBaseURL(
                            source.getString("baseUrl"), html, HTML_MIME_TYPE, HTML_ENCODING, null);
                } else {
                    view.loadData(html, HTML_MIME_TYPE, HTML_ENCODING);
                }
                return;
            }
            if (source.hasKey("uri")) {
                String url = source.getString("uri");
                String previousUrl = view.getUrl();
                if (previousUrl != null && previousUrl.equals(url)) {
                    return;
                }
                if (source.hasKey("method")) {
                    String method = source.getString("method");
                    if (method.equals(HTTP_METHOD_POST)) {
                        byte[] postData = null;
                        if (source.hasKey("body")) {
                            String body = source.getString("body");
                            try {
                                postData = body.getBytes("UTF-8");
                            } catch (UnsupportedEncodingException e) {
                                postData = body.getBytes();
                            }
                        }
                        if (postData == null) {
                            postData = new byte[0];
                        }
                        view.postUrl(url, postData);
                        return;
                    }
                }
                HashMap<String, String> headerMap = new HashMap<>();
                if (source.hasKey("headers")) {
                    ReadableMap headers = source.getMap("headers");
                    ReadableMapKeySetIterator iter = headers.keySetIterator();
                    while (iter.hasNextKey()) {
                        String key = iter.nextKey();
                        if ("user-agent".equals(key.toLowerCase(Locale.ENGLISH))) {
                            if (view.getSettings() != null) {
                                view.getSettings().setUserAgentString(headers.getString(key));
                            }
                        } else {
                            headerMap.put(key, headers.getString(key));
                        }
                    }
                }
                view.loadUrl(url, headerMap);
                return;
            }
        }
        view.loadUrl(BLANK_URL);
    }

    @ReactProp(name = "onContentSizeChange")
    public void setOnContentSizeChange(WebView view, boolean sendContentSizeChangeEvents) {
        if (sendContentSizeChangeEvents) {
            view.setPictureListener(getPictureListener());
        } else {
            view.setPictureListener(null);
        }
    }

    @Override
    protected void addEventEmitters(ThemedReactContext reactContext, WebView view) {
        // Do not register default touch emitter and let WebView implementation handle touches
        view.setWebViewClient(new NativeWebViewManager.ReactWebViewClient());
    }

    @Override
    public @Nullable Map<String, Integer> getCommandsMap() {
        return MapBuilder.of(
                "goBack", COMMAND_GO_BACK,
                "goForward", COMMAND_GO_FORWARD,
                "reload", COMMAND_RELOAD,
                "stopLoading", COMMAND_STOP_LOADING,
                "postMessage", COMMAND_POST_MESSAGE);
    }

    @Override
    public void receiveCommand(WebView root, int commandId, @Nullable ReadableArray args) {
        switch (commandId) {
            case COMMAND_GO_BACK:
                root.goBack();
                break;
            case COMMAND_GO_FORWARD:
                root.goForward();
                break;
            case COMMAND_RELOAD:
                root.reload();
                break;
            case COMMAND_STOP_LOADING:
                root.stopLoading();
                break;
            case COMMAND_POST_MESSAGE:
                try {
                    JSONObject eventInitDict = new JSONObject();
                    eventInitDict.put("data", args.getString(0));
                    root.loadUrl("javascript:(document.dispatchEvent(new MessageEvent('message', " + eventInitDict.toString() + ")))");
                } catch (JSONException e) {
                    throw new RuntimeException(e);
                }
                break;
        }
    }

    @Override
    public void onDropViewInstance(WebView webView) {
        super.onDropViewInstance(webView);
        mReactContext.removeLifecycleEventListener((NativeWebViewManager.ReactWebView) webView);
        ((NativeWebViewManager.ReactWebView) webView).cleanupCallbacksAndDestroy();
    }

    @Nullable
    @Override
    public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
        Map<String, Object> map = new HashMap<>();
        map.put("startDownloadEvent", MapBuilder.of("registrationName", "onStartDownload"));
        map.put("updateLoadingProgress", MapBuilder.of("registrationName", "onProgressChange"));
        return map;
    }

    private void initWebSettings(WebView webView) {
        WebSettings settings = webView.getSettings();
        settings.setAllowFileAccess(true);
        settings.setTextSize(WebSettings.TextSize.NORMAL);
        settings.setSupportMultipleWindows(false);
        settings.setLoadWithOverviewMode(true);
        settings.setAppCacheEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setGeolocationEnabled(true);
        settings.setAppCacheMaxSize(Long.MAX_VALUE);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        settings.setDisplayZoomControls(false);
        settings.setSupportZoom(true);
        // 设置出现缩放工具
        settings.setBuiltInZoomControls(true);
        //设置可在大视野范围内上下左右拖动，并且可以任意比例缩放
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        //自适应屏幕
        settings.setLayoutAlgorithm(WebSettings.LayoutAlgorithm.NARROW_COLUMNS);

        // 设置代理
        initWebProxy(webView);
    }

    private void initWebProxy(WebView webView) {
        SharedPreferences prefs = PreferenceManager
                .getDefaultSharedPreferences(mReactContext);
        boolean isProxyEnabled = prefs.getBoolean(NativeWebViewProxySetting.PREF_PROXY_ENABLED, false);
        if (isProxyEnabled) {
            String ip = prefs.getString(NativeWebViewProxySetting.PREF_PROXY_IP, null);
            int port = prefs.getInt(NativeWebViewProxySetting.PREF_PROXY_PORT, 0);
            if (!TextUtils.isEmpty(ip) && port != 0) {
                NativeWebViewProxySetting.setProxy(webView, ip, port);
            }
        }
    }


    private WebView.PictureListener getPictureListener() {
        if (mPictureListener == null) {
            mPictureListener = new WebView.PictureListener() {
                @Override
                public void onNewPicture(WebView webView, Picture picture) {
                    dispatchEvent(
                            webView,
                            new ContentSizeChangeEvent(
                                    webView.getId(),
                                    webView.getWidth(),
                                    webView.getContentHeight()));
                }
            };
        }
        return mPictureListener;
    }

    private void dispatchEvent(WebView webView, Event event) {
        ReactContext reactContext = mReactContext;
        EventDispatcher eventDispatcher =
                reactContext.getNativeModule(UIManagerModule.class).getEventDispatcher();
        eventDispatcher.dispatchEvent(event);
    }
}
