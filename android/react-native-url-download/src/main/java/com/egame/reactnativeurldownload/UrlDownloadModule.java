package com.egame.reactnativeurldownload;

import android.provider.Settings;
import android.util.Log;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;



/*
 * FileName:    UrlDownloadModule.java
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     12/22/16 1.00 初始版本
 */


/*package*/ class UrlDownloadModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext mReactContext;

    /*package*/ UrlDownloadModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mReactContext = reactContext;
    }

    @Override
    public String getName() {
        return "UrlDownload";
    }


    @ReactMethod
    public void foo(Callback callback) {
        callback.invoke(1, 2);
    }

    @ReactMethod
    public void barPromise(final Promise promise) {
        Log.e("UrlDownloadModule", "barPromise: start ");
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Thread.sleep(1000);
                    promise.resolve("this is done");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }

            }
        }).start();
        Log.e("UrlDownloadModule", "barPromise: end ");
    }
}
