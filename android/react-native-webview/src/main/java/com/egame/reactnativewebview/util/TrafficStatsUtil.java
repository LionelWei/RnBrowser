package com.egame.reactnativewebview.util;


/*
 * FileName:    TrafficStatsUtil.java
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     3/15/17 1.00 初始版本
 */


import android.content.Context;
import android.content.SharedPreferences;
import android.net.TrafficStats;
import android.preference.PreferenceManager;

import com.egame.reactnativewebview.eventbus.ProxyConfigUpdateEvent;

import org.greenrobot.eventbus.EventBus;

public class TrafficStatsUtil {
    public static final String PREF_TOTAL_MOBILE_DATA = "PREF_TOTAL_MOBILE_DATA";
    public static final String PREF_TOTAL_FREE_DATA = "PREF_TOTAL_FREE_DATA";

    private static long totalTraffic = 0;
    private static long trafficSinceLaunch = 0;
    private static long trafficWhenLaunch = 0;
    private static boolean isFirstMobileRecorded = false;
    private static long FREE_LIMIT = 2L * 1024L * 1024L * 1024L; // 单位: 字节

    public static void setFreeThreshold(long maxBytes) {
        FREE_LIMIT = maxBytes;
    }

    public static void updateTrafficStatsOnCreate(Context context) {
        SharedPreferences prefs = PreferenceManager
                .getDefaultSharedPreferences(context);
        totalTraffic = prefs.getLong(PREF_TOTAL_MOBILE_DATA, 0);
        boolean isMobile = NetworkUtil.canTurnOnProxy(context);
        if (isMobile) {
            trafficWhenLaunch = getMobileBytes();
            isFirstMobileRecorded = true;
        }
    }

    public static void updateTrafficStatsWhenNetworkChange(Context context) {
        if (!isFirstMobileRecorded) {
            trafficWhenLaunch = getMobileBytes();
        }
    }

    public static void updateTrafficStatsOnDestroy(Context context) {
        long total = totalTraffic + trafficSinceLaunch;
        SharedPreferences prefs = PreferenceManager
                .getDefaultSharedPreferences(context);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putLong(PREF_TOTAL_MOBILE_DATA, total);
        editor.apply();
    }

    public static void updateTrafficStats(Context context) {
        long total = getMobileBytes();
        // 值为0时, 说明没有消耗流量或处于wifi状态
        if (total == 0) {
            return;
        }
        if (isExceedFreeLimit()) {
            EventBus.getDefault().post(new ProxyConfigUpdateEvent(false));
        }
        trafficSinceLaunch = total - trafficWhenLaunch;
        totalTraffic += trafficSinceLaunch;
        SharedPreferences prefs = PreferenceManager
                .getDefaultSharedPreferences(context);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putLong(PREF_TOTAL_MOBILE_DATA, totalTraffic);
        editor.putLong(PREF_TOTAL_FREE_DATA, isExceedFreeLimit() ? FREE_LIMIT : totalTraffic);
        editor.apply();
    }

    public static boolean isExceedFreeLimit() {
        return totalTraffic > FREE_LIMIT;
    }

    private static long getMobileBytes() {
        long rx = TrafficStats.getMobileRxBytes();
        long tx = TrafficStats.getMobileTxBytes();
        return rx + tx;
    }

}
