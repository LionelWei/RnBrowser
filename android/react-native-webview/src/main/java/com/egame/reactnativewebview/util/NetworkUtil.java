package com.egame.reactnativewebview.util;

/*
 * FileName:	
 * Copyright:	炫彩互动网络科技有限公司
 * Author: 		weilai
 * Description:	<文件描述>
 * History:		2016/7/7 1.00 初始版本
 */

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.telephony.TelephonyManager;

public class NetworkUtil {
    public static final int NETWORK_WIFI = 0x1;
    public static final int NETWORK_4G = 0x2;
    public static final int NETWORK_3G2G = 0x3;
    public static final int NETWORK_WIFI_DISCONNECTED = 0x4;
    public static final int NETWORK_NOT_TELCOMM = 0x5;
    public static int checkState(Context context) {
        // 如果不是电信运营商, 直接返回
        if (!ImsiUtil.isTelcommOperator(context.getApplicationContext())) {
            return NETWORK_NOT_TELCOMM;
        }

        int state = -1;
        ConnectivityManager cm = (ConnectivityManager) context
                .getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo.State wifi = cm.getNetworkInfo(
                ConnectivityManager.TYPE_WIFI).getState();
        NetworkInfo.State mobile = cm.getNetworkInfo(
                ConnectivityManager.TYPE_MOBILE).getState();
        // 4g
        int subType = 0;
        NetworkInfo netInfo = cm.getActiveNetworkInfo();
        if (netInfo != null) {
            subType = netInfo.getSubtype();
        }
        if (subType == TelephonyManager.NETWORK_TYPE_LTE) {
            state = NETWORK_4G;
        } else if (wifi != null && wifi == NetworkInfo.State.CONNECTED) {
            state = NETWORK_WIFI;
        } else if (mobile != null && mobile == NetworkInfo.State.CONNECTED) {
            state = NETWORK_3G2G;
        } else {
            state = NETWORK_WIFI_DISCONNECTED;
        }

        return state;
    }

    public static boolean canTurnOnProxy(Context context) {
        int state = checkState(context);
        // 移动网络时 设置代理
        // WIFI时 切断代理直接访问原始服务器
        switch (state) {
            case NetworkUtil.NETWORK_WIFI:
            case NetworkUtil.NETWORK_NOT_TELCOMM:
                return false;
            case NetworkUtil.NETWORK_4G:
            case NetworkUtil.NETWORK_3G2G:
            case NetworkUtil.NETWORK_WIFI_DISCONNECTED:
            default:
                return true;
        }
    }

}
