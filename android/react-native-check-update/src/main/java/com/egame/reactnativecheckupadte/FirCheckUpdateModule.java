package com.egame.reactnativecheckupadte;


/*
 * FileName:    FirCheckUpdateModule.java
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     3/23/17 1.00 初始版本
 */


import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;

import im.fir.sdk.FIR;
import im.fir.sdk.VersionCheckCallback;

public class FirCheckUpdateModule extends ReactContextBaseJavaModule {
    private Context mContext;
    public static final String TAG = "FirCheckUpdateModule";
    private int mAppVersionCode;
    private String mAppVersionName;

    public FirCheckUpdateModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
        getAppVersion();
    }

    @Override
    public String getName() {
        return "FirCheckUpdate";
    }

    @ReactMethod
    public void checkUpdate(String firToken, final Promise promise) {
        FIR.checkForUpdateInFIR(firToken , new VersionCheckCallback() {
            @Override
            public void onSuccess(String versionJSON) {
                WritableMap map = Arguments.createMap();
                try {
                    Gson gson = new Gson();
                    FirResultModel model = gson.fromJson(versionJSON, FirResultModel.class);
                    Integer version = Integer.valueOf(model.version);
                    if (version != null && version > mAppVersionCode) {
                        map.putBoolean("needUpdate", true);
                        map.putString("downloadUrl", model.direct_install_url);
                    } else {
                        map.putBoolean("needUpdate", false);
                        map.putString("downloadUrl", model.direct_install_url);
                    }
                } catch (JsonSyntaxException e) {
                    map.putBoolean("needUpdate", false);
                } finally {
                    promise.resolve(map);
                }
            }

            @Override
            public void onFail(Exception exception) {
                promise.resolve("false");
            }

            @Override
            public void onStart() {
            }

            @Override
            public void onFinish() {
            }
        });
    }

    @ReactMethod
    public void getCurrentVersion(Promise promise) {
        promise.resolve(mAppVersionName);
    }

    private void getAppVersion() {
        PackageManager manager = mContext.getPackageManager();
        try {
            PackageInfo info = manager.getPackageInfo(mContext.getPackageName(), 0);
            mAppVersionCode = info.versionCode;
            mAppVersionName = info.versionName;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
    }
}
