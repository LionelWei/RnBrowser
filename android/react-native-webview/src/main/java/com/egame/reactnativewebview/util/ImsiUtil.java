package com.egame.reactnativewebview.util;

/*
 * FileName:    
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     7/26/16 1.00 初始版本
 */

import android.content.Context;
import android.os.IBinder;
import android.telephony.TelephonyManager;
import android.text.TextUtils;

import java.lang.reflect.Method;

public class ImsiUtil {
    private static String sImsi;
    private static boolean isTelComm;

    /**
     * 判断是否是电信运营商
     */
    public static boolean isTelcommOperator(Context context) {
        if (TextUtils.isEmpty(sImsi)) {
            sImsi = getImsi(context);
            isTelComm = !TextUtils.isEmpty(sImsi)
                    && (sImsi.startsWith("46003")
                    || sImsi.startsWith("46005")
                    || sImsi.startsWith("46011"));
        }
        return isTelComm;
    }

    public static String getImsi(Context context) {
        String imsi = null;
        try {
            imsi = getImsiFromSubscriberId(context);
        } catch (Exception e) {
            // L.printTrace(e);
        }
        if (imsiIsEmpty(imsi)) {
            try {
                Class<?> cx = Class
                        .forName("android.telephony.MSimTelephonyManager");
                Object obj = context.getSystemService("phone_msim");
                Method ms = cx.getMethod("getSubscriberId", int.class);
                imsi = (String) ms.invoke(obj, 0);
            } catch (Exception e) {
                // L.printTrace(e);
            }
        }
        if (imsiIsEmpty(imsi)) {
            try {
                Class<?> cx = Class
                        .forName("android.telephony.MSimTelephonyManager");
                Object obj = context.getSystemService("phone_msim");
                Method ms = cx.getMethod("getSubscriberId", int.class);
                imsi = (String) ms.invoke(obj, 1);
            } catch (Exception e) {
                // L.printTrace(e);
            }
        }
        if (imsiIsEmpty(imsi)) {
            try {
                Class<?> telephonyClass = Class
                        .forName("android.telephony.TelephonyManager");
                Method getSecond = telephonyClass.getMethod("getSecondary");
                TelephonyManager ret = (TelephonyManager) getSecond.invoke(
                        context.getSystemService(Context.TELEPHONY_SERVICE),
                        new Object[] {});
                imsi = ret.getSubscriberId() + "";
            } catch (Exception e) {
                // L.printTrace(e);
            }
        }
        return imsi;
    }

    private static boolean imsiIsEmpty(String s) {
        return TextUtils.isEmpty(s) || s.toLowerCase().equals("null")
                || s.toLowerCase().equals("unknown");
    }

    private static String getImsiFromSubscriberId(Context context) {
        String imsi = getSubscriberId(0);
        if (TextUtils.isEmpty(imsi)) {
            imsi = getSubscriberId(1);
        }
        if (TextUtils.isEmpty(imsi)) {
            imsi = getImsi1(context);
        }
        return imsi;
    }

    private static String getImsi1(Context mContext) {
        TelephonyManager tm = (TelephonyManager) mContext
                .getSystemService(Context.TELEPHONY_SERVICE);
        try {
            String imsi = tm.getSubscriberId();
            if (imsi == null) {
                imsi = "";
            }
            return imsi;
        } catch (Exception e) {
            return "";
        } catch (StackOverflowError er) {
            return "";
        }
    }

    private static String getSubscriberId(int cardIndex) {
        String name = null;
        name = (cardIndex == 1) ? "iphonesubinfo2" : "iphonesubinfo";
        try {
            Method method = Class.forName("android.os.ServiceManager")
                    .getDeclaredMethod("getService",
                            new Class[] { String.class });
            method.setAccessible(true);
            Object param = method.invoke(null, new Object[] { name });
            if ((param == null) && (cardIndex == 1))
                param = method.invoke(null, new Object[] { "iphonesubinfo1" });
            if (param == null)
                return null;
            method = Class.forName(
                    "com.android.internal.telephony.IPhoneSubInfo$Stub")
                    .getDeclaredMethod("asInterface",
                            new Class[] { IBinder.class });
            method.setAccessible(true);
            Object stubObj = method.invoke(null, new Object[] { param });
            return (String) stubObj.getClass()
                    .getMethod("getSubscriberId", new Class[0])
                    .invoke(stubObj, new Object[0]);
        } catch (Exception e) {
        } catch (StackOverflowError er) {
        }
        return "";
    }
}
