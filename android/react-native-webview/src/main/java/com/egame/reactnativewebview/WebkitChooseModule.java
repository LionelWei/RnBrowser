package com.egame.reactnativewebview;


/*
 * FileName:    WebkitChooseModule.java
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     1/17/17 1.00 初始版本
 */


import android.content.Context;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

public class WebkitChooseModule extends ReactContextBaseJavaModule {
    public static final String TAG = "WebKitChooseModule";
    /*package*/ static final String PREF_IS_X5_WEBKIT = "PREF_IS_X5_WEBKIT";
    private Context mContext;

    public WebkitChooseModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
    }

    @Override
    public String getName() {
        return "WebkitChoose";
    }

    @ReactMethod
    public void choose(ReadableMap options) {
        Log.e(TAG, "choose st");
        boolean isX5 = false;
        if (options.hasKey("isX5")) {
            isX5 = options.getBoolean("isX5");
        }
        Log.e(TAG, "choose: isX5: " + isX5);
        SharedPreferences prefs = PreferenceManager.getDefaultSharedPreferences(mContext);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putBoolean(PREF_IS_X5_WEBKIT, isX5);
        editor.apply();
    }
}
