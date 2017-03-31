package com.egame.reactnativewebview;

import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.Picture;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.support.v7.app.AlertDialog;
import android.text.TextUtils;
import android.util.Log;
import android.util.SparseArray;
import android.view.GestureDetector;
import android.view.MotionEvent;
import android.view.ViewGroup.LayoutParams;
import android.view.inputmethod.InputMethodManager;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;

import com.egame.reactnativewebview.eventbus.ProxyAsPerNetworkEvent;
import com.egame.reactnativewebview.eventbus.ProxyConfigUpdateEvent;
import com.egame.reactnativewebview.events.LongPressEvent;
import com.egame.reactnativewebview.events.OverrideUrlEvent;
import com.egame.reactnativewebview.events.StartDownloadEvent;
import com.egame.reactnativewebview.events.TopLoadingErrorEvent;
import com.egame.reactnativewebview.events.TopLoadingFinishEvent;
import com.egame.reactnativewebview.events.TopLoadingStartEvent;
import com.egame.reactnativewebview.events.TopMessageEvent;
import com.egame.reactnativewebview.events.UpdateLoadingProgressEvent;
import com.egame.reactnativewebview.util.TrafficStatsUtil;
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
import com.tencent.smtt.export.external.interfaces.GeolocationPermissionsCallback;
import com.tencent.smtt.export.external.interfaces.HttpAuthHandler;
import com.tencent.smtt.sdk.DownloadListener;
import com.tencent.smtt.sdk.ValueCallback;
import com.tencent.smtt.sdk.WebChromeClient;
import com.tencent.smtt.sdk.WebSettings;
import com.tencent.smtt.sdk.WebView;
import com.tencent.smtt.sdk.WebViewClient;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import javax.annotation.Nullable;

import static android.content.Context.INPUT_METHOD_SERVICE;
import static com.tencent.smtt.sdk.WebView.HitTestResult.EMAIL_TYPE;
import static com.tencent.smtt.sdk.WebView.HitTestResult.IMAGE_TYPE;
import static com.tencent.smtt.sdk.WebView.HitTestResult.PHONE_TYPE;
import static com.tencent.smtt.sdk.WebView.HitTestResult.SRC_IMAGE_ANCHOR_TYPE;

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
@ReactModule(name = X5WebViewManager.REACT_CLASS)
public class X5WebViewManager extends SimpleViewManager<WebView> {

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
    public static final int COMMAND_RESUME = 6;
    public static final int COMMAND_PAUSE = 7;

    // Use `webView.loadUrl("about:blank")` to reliably reset the view
    // state and release page resources (including any running JavaScript).
    private static final String BLANK_URL = "about:blank";
    private static SparseArray<String> sHitTypeArray = new SparseArray<>();

    static {
        sHitTypeArray.put(PHONE_TYPE, "phone");
        sHitTypeArray.put(EMAIL_TYPE, "email");
        sHitTypeArray.put(IMAGE_TYPE, "image");
        sHitTypeArray.put(SRC_IMAGE_ANCHOR_TYPE, "image");
    }

    private ReactContext mReactContext;
    private WebViewConfig mWebViewConfig;
    private WebView mWebView;
    private @Nullable WebView.PictureListener mPictureListener;

    private int mProgress;

    private class ReactWebViewClient extends WebViewClient {

        private boolean mLastLoadFailed = false;

        @Override
        public void onPageFinished(WebView webView, String url) {
            super.onPageFinished(webView, url);

            if (!mLastLoadFailed) {
                X5WebViewManager.ReactWebView reactWebView = (X5WebViewManager.ReactWebView) webView;
                reactWebView.linkBridge();
                reactWebView.callInjectedJavaScript();
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

//        @Override
//        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
//            return false;
//        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            Log.e(REACT_CLASS, "shouldOverrideUrlLoading: " + url);

            if (url.startsWith("http://") || url.startsWith("https://") ||
                    url.startsWith("file://")) {
                // 统计流量消耗
                TrafficStatsUtil.updateTrafficStats(mReactContext);

                // 修复部分页面跳转时软键盘不隐藏的问题
                InputMethodManager imm = (InputMethodManager)mReactContext.getSystemService(INPUT_METHOD_SERVICE);
                imm.hideSoftInputFromWindow(view.getWindowToken(), 0);

                WebView.HitTestResult result = view.getHitTestResult();
                int type = result.getType();
                if (type > 0) {
                    String resultUrl = result.getExtra();
                    Log.e(TAG, "shouldOverrideUrlLoading: type: " + type + ", url: " + resultUrl);
                    String typeString = sHitTypeArray.get(type);
                    if (typeString == null) {
                        typeString = "";
                    }
                    // 每个链接都由上层自行处理 (如新建webview打开)
                    dispatchEvent(
                            view,
                            new OverrideUrlEvent(
                                    view.getId(),
                                    createOverrideUrlEvent(url, typeString)));
                    return true;
                } else {
                    return false;
                }
            } else {
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    view.getContext().startActivity(intent);
                } catch (ActivityNotFoundException e) {
                    Log.e(TAG, "activity not found to handle uri scheme for: " + url, e);
                    return false;
                }
                return true;
            }
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

        private WritableMap createOverrideUrlEvent(String url, String hitType) {
            WritableMap event = Arguments.createMap();
            event.putString("newUrl", url);
            event.putString("type", hitType);
            return event;
        }
    }

    private class ReactWebChromeClient extends WebChromeClient {
        @Override
        public void onProgressChanged(WebView webView, int progress) {
            if (progress >= mProgress) {
                mProgress = progress;
                dispatchEvent(
                        webView,
                        new UpdateLoadingProgressEvent(
                                webView.getId(),
                                createProgressEvent(progress)));
            }
        }

        @Override
        public void onGeolocationPermissionsShowPrompt(final String s, final GeolocationPermissionsCallback callback) {
            Log.e(TAG, "onGeolocationPermissionsShowPrompt: " + s);
            final boolean remember = true;
            AlertDialog.Builder builder = new AlertDialog.Builder(mReactContext);
            builder.setTitle("定位");
            builder.setMessage("当前网页想要获取您的位置")
                    .setCancelable(true)
                    .setPositiveButton("允许",
                            new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialog,
                                                    int id) {
                                    // origin, allow, remember
                                    callback.invoke(s, true, remember);
                                }
                            })
                    .setNegativeButton("拒绝",
                            new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialog,
                                                    int id) {
                                    // origin, allow, remember
                                    callback.invoke(s, false, remember);
                                }
                            });
            AlertDialog alert = builder.create();
            alert.show();
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
        private GestureDetector mGestureDetector;
        private int downX, downY;

        private class ReactWebViewBridge {
            X5WebViewManager.ReactWebView mContext;

            ReactWebViewBridge(X5WebViewManager.ReactWebView c) {
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
            mGestureDetector = new GestureDetector(getContext(), new GestureDetector.SimpleOnGestureListener() {
                @Override
                public void onLongPress(MotionEvent e) {
                    downX = (int) e.getX();
                    downY = (int) e.getY();
                    Log.e(TAG, "onLongPress: (x,y): " + downX + ", " + downY);

                    WebView.HitTestResult result = ReactWebView.this.getHitTestResult();
                    int type = result.getType();
                    if (type > 0) {
                        String typeString = sHitTypeArray.get(type);
                        String extra = result.getExtra();
                        if (typeString == null) {
                            typeString = "";
                        }

                        Log.e(TAG, "webview: type: " + type + ", typeString: " + typeString);
                        dispatchEvent(ReactWebView.this,
                                new LongPressEvent(
                                        getId(),
                                        createLongPressEvent(extra, typeString, downX, downY)));
                    }
                }
            });
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
            if (mIsProxyEnabled) {
                if (TrafficStatsUtil.isExceedFreeLimit()) {
                    X5WebViewProxySetting.revertBackProxy(this);
                }
                mProxyIp = event.proxyIp;
                mProxyPort = event.proxyPort;
                X5WebViewProxySetting.setProxy(this, mProxyIp, mProxyPort);
            } else {
                X5WebViewProxySetting.revertBackProxy(this);
            }
        }

        @Subscribe
        public void onNetworkStateUpdate(ProxyAsPerNetworkEvent event) {
            if (mIsProxyEnabled) {
                X5WebViewProxySetting.setProxy(this, mProxyIp, mProxyPort);
            } else {
                X5WebViewProxySetting.revertBackProxy(this);
            }
        }

        @Override
        public void onHostDestroy() {
            cleanupCallbacksAndDestroy();
        }

        @Override
        public boolean onTouchEvent(MotionEvent event) {
            mGestureDetector.onTouchEvent(event);
            return super.onTouchEvent(event);
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
                addJavascriptInterface(new X5WebViewManager.ReactWebView.ReactWebViewBridge(this), BRIDGE_NAME);
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

        private WritableMap createLongPressEvent(String url, String hitType, int x, int y) {
            WritableMap event = Arguments.createMap();
            event.putString("newUrl", url);
            event.putString("type", hitType);
            event.putInt("x", px2dx(x));
            event.putInt("y", px2dx(y));
            return event;
        }

        private int px2dx(float pxValue) {
            final float scale = getContext().getResources().getDisplayMetrics().density;
            return (int) (pxValue / scale + 0.5f);
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

    public X5WebViewManager() {
        mWebViewConfig = new WebViewConfig() {
            public void configWebView(WebView webView) {
            }
        };
    }

    public X5WebViewManager(WebViewConfig webViewConfig) {
        mWebViewConfig = webViewConfig;
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected WebView createViewInstance(ThemedReactContext reactContext) {
        Log.d(REACT_CLASS, "createViewInstance: ");
        X5WebViewManager.ReactWebView webView = new X5WebViewManager.ReactWebView(reactContext);
        mReactContext = reactContext;
        mWebView = webView;

        Log.e(TAG, "createViewInstance: version: " + WebView.getTbsCoreVersion(mReactContext));
        // 去掉快速滑动条
        if (webView.getX5WebViewExtension() != null) {
            Log.e(TAG, "createViewInstance: webView.getX5WebViewExtension() not null");
            webView.getX5WebViewExtension().setScrollBarFadingEnabled(false);
            Bundle data = new Bundle();
            data.putBoolean("standardFullScreen", false);//true表示标准全屏，false表示X5全屏；不设置默认false，
            data.putBoolean("supportLiteWnd", false);//false：关闭小窗；true：开启小窗；不设置默认true，
            data.putInt("DefaultVideoScreen", 2);//1：以页面内开始播放，2：以全屏开始播放；不设置默认：1
            webView.getX5WebViewExtension().invokeMiscMethod("setVideoParams", data);
        }

        webView.setWebChromeClient(new ReactWebChromeClient());
        reactContext.addLifecycleEventListener(webView);
        mWebViewConfig.configWebView(webView);
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

    @ReactProp(name = "mediaPlaybackRequiresUserAction")
    public void setMediaPlaybackRequiresUserAction(WebView view, boolean requires) {
        view.getSettings().setMediaPlaybackRequiresUserGesture(requires);
    }

    @ReactProp(name = "injectedJavaScript")
    public void setInjectedJavaScript(WebView view, @Nullable String injectedJavaScript) {
        ((X5WebViewManager.ReactWebView) view).setInjectedJavaScript(injectedJavaScript);
    }

    @ReactProp(name = "messagingEnabled")
    public void setMessagingEnabled(WebView view, boolean enabled) {
        ((X5WebViewManager.ReactWebView) view).setMessagingEnabled(enabled);
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
        view.setWebViewClient(new X5WebViewManager.ReactWebViewClient());
    }

    @Override
    public @Nullable Map<String, Integer> getCommandsMap() {
        return MapBuilder.of(
                "goBack", COMMAND_GO_BACK,
                "goForward", COMMAND_GO_FORWARD,
                "reload", COMMAND_RELOAD,
                "stopLoading", COMMAND_STOP_LOADING,
                "postMessage", COMMAND_POST_MESSAGE,
                "resume", COMMAND_RESUME,
                "pause", COMMAND_PAUSE);
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
            case COMMAND_RESUME:
                root.onResume();
                root.resumeTimers();
                break;
            case COMMAND_PAUSE:
                root.pauseTimers();
                root.onPause();
                break;
        }
    }

    @Override
    public void onDropViewInstance(WebView webView) {
        super.onDropViewInstance(webView);
        mReactContext.removeLifecycleEventListener((X5WebViewManager.ReactWebView) webView);
        ((X5WebViewManager.ReactWebView) webView).cleanupCallbacksAndDestroy();
    }

    @Nullable
    @Override
    public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
        Map<String, Object> map = new HashMap<>();
        map.put("startDownloadEvent", MapBuilder.of("registrationName", "onStartDownload"));
        map.put("updateLoadingProgress", MapBuilder.of("registrationName", "onProgressChange"));
        map.put("overrideUrl", MapBuilder.of("registrationName", "onOverrideUrlLoading"));
        map.put("longPress", MapBuilder.of("registrationName", "onLongPress"));
        return map;
    }

    private void initWebSettings(WebView webView) {
        WebSettings settings = webView.getSettings();

        mWebView.setDrawingCacheBackgroundColor(Color.WHITE);
        mWebView.setFocusableInTouchMode(true);
        mWebView.setFocusable(true);
        mWebView.setDrawingCacheEnabled(false);
        mWebView.setWillNotCacheDrawing(true);

        // 改善滑动性能
        if (API < Build.VERSION_CODES.JELLY_BEAN_MR2) {
            //noinspection deprecation
            settings.setAppCacheMaxSize(Long.MAX_VALUE);
        }
        if (API < Build.VERSION_CODES.JELLY_BEAN_MR1) {
            //noinspection deprecation
            settings.setEnableSmoothTransition(true);
        }
        if (API > Build.VERSION_CODES.JELLY_BEAN) {
            settings.setMediaPlaybackRequiresUserGesture(true);
        }

        settings.setAllowFileAccess(true);
        settings.setTextSize(WebSettings.TextSize.NORMAL);
        settings.setSupportMultipleWindows(false);
        settings.setLoadWithOverviewMode(true);
        settings.setAppCacheEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setGeolocationEnabled(true);
        settings.setAppCacheMaxSize(Long.MAX_VALUE);
        settings.setCacheMode(android.webkit.WebSettings.LOAD_DEFAULT);

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
        boolean isProxyEnabled = prefs.getBoolean(X5WebViewProxySetting.PREF_PROXY_ENABLED, false);
        if (isProxyEnabled) {
            String ip = prefs.getString(X5WebViewProxySetting.PREF_PROXY_IP, null);
            int port = prefs.getInt(X5WebViewProxySetting.PREF_PROXY_PORT, 0);
            if (!TextUtils.isEmpty(ip) && port != 0) {
                X5WebViewProxySetting.setProxy(webView, ip, port);
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

    private int dp2px(Context context, float dpValue) {
        final float scale = context.getResources().getDisplayMetrics().density;
        return (int) (dpValue * scale + 0.5f);
    }
}
