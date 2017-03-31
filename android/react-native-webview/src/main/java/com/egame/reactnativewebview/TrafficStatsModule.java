package com.egame.reactnativewebview;

import android.content.Context;
import android.content.SharedPreferences;
import android.net.TrafficStats;
import android.preference.PreferenceManager;

import com.egame.reactnativewebview.util.TrafficStatsUtil;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/*
 * FileName:    TrafficStatsModule.java
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     3/14/17 1.00 初始版本
 */


public class TrafficStatsModule extends ReactContextBaseJavaModule {
    public static final String TAG = "TrafficStats";
    private Context mContext;

    public TrafficStatsModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
    }

    @Override
    public String getName() {
        return "TrafficStats";
    }

    @ReactMethod
    public void setFreeThreshold(double threshold) {
        long maxByte =  (long) threshold;
        TrafficStatsUtil.setFreeThreshold(maxByte);
    }

    @ReactMethod
    public void getMobileBytes(Promise promise) {
        SharedPreferences prefs = PreferenceManager
                .getDefaultSharedPreferences(mContext);
        long mobile = prefs.getLong(TrafficStatsUtil.PREF_TOTAL_MOBILE_DATA, 0);
        promise.resolve(mobile + "");
    }

    @ReactMethod
    public void getFreeBytes(Promise promise) {
        SharedPreferences prefs = PreferenceManager
                .getDefaultSharedPreferences(mContext);
        long mobile = prefs.getLong(TrafficStatsUtil.PREF_TOTAL_FREE_DATA, 0);
        promise.resolve(mobile + "");
    }
}
