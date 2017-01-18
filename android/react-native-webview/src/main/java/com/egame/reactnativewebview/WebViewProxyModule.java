package com.egame.reactnativewebview;

import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.util.Log;

import com.egame.reactnativewebview.eventbus.ProxyConfigUpdateEvent;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import org.greenrobot.eventbus.EventBus;



/*
 * FileName:    WebViewProxyModule.java
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     1/4/17 1.00 初始版本
 */


public class WebViewProxyModule extends ReactContextBaseJavaModule {
    public static final String TAG = "WebViewProxyModule";

    private final ReactApplicationContext mReactContext;
    private String proxyIp;
    private int proxyPort;
    private String authName;
    private String authPwd;
    private boolean isProxyEnabled;

    /*package*/ WebViewProxyModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.mReactContext = reactContext;
    }

    @Override
    public String getName() {
        return "WebViewProxy";
    }

    @ReactMethod
    public void save(ReadableMap options) {
        Log.e(TAG, "save st");
        if (options.hasKey("enabled")) {
            isProxyEnabled = options.getBoolean("enabled");
        }
        if (options.hasKey("ip")) {
            proxyIp = options.getString("ip");
        }
        if (options.hasKey("port")) {
            proxyPort = options.getInt("port");
        }
        if (options.hasKey("userName")) {
            authName = options.getString("userName");
        }
        if (options.hasKey("password")) {
            authPwd = options.getString("password");
        }

        SharedPreferences prefs = PreferenceManager
                .getDefaultSharedPreferences(mReactContext);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putBoolean(X5WebViewProxySetting.PREF_PROXY_ENABLED, isProxyEnabled);
        editor.putString(X5WebViewProxySetting.PREF_PROXY_IP, proxyIp);
        editor.putInt(X5WebViewProxySetting.PREF_PROXY_PORT, proxyPort);
        editor.putString(X5WebViewProxySetting.PREF_PROXY_USER_NAME, authName);
        editor.putString(X5WebViewProxySetting.PREF_PROXY_PASSWORD, authPwd);
        editor.apply();

        EventBus.getDefault().post(new ProxyConfigUpdateEvent(
                isProxyEnabled,
                proxyIp,
                proxyPort,
                authName,
                authPwd));

        Log.e(TAG, "save end");
    }

}
