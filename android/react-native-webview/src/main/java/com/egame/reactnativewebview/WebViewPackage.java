package com.egame.reactnativewebview;


import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.util.Log;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class WebViewPackage implements ReactPackage {
    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        return Arrays.<NativeModule>asList(
                new WebViewProxyModule(reactContext)
                , new WebkitChooseModule(reactContext));
    }

    @Override
    public List<Class<? extends JavaScriptModule>> createJSModules() {
        return Collections.emptyList();
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        SharedPreferences prefs = PreferenceManager
                .getDefaultSharedPreferences(reactContext);
        boolean isX5 = prefs.getBoolean(WebkitChooseModule.PREF_IS_X5_WEBKIT, false);
        Log.e("WebViewPackage", "createViewManagers: isX5: " + isX5);
        return isX5
                ? Arrays.<ViewManager>asList(new X5WebViewManager())
                : Arrays.<ViewManager>asList(new NativeWebViewManager());
    }
}