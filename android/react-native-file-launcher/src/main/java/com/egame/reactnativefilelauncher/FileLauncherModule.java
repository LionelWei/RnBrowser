package com.egame.reactnativefilelauncher;


/*
 * FileName:    FileLauncherModule.java
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     3/30/17 1.00 初始版本
 */


import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.support.v4.content.FileProvider;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.json.JSONException;

import java.io.File;

public class FileLauncherModule extends ReactContextBaseJavaModule {
    public static final String TAG = "FileLauncherModule";
    private Context mContext;

    public FileLauncherModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
    }

    // 为了与原有的包兼容
    @Override
    public String getName() {
        return "FileLauncher";
    }

    @ReactMethod
    public void open(String fileArg, String contentType, Promise promise) throws JSONException {
        File file = new File(fileArg);

        if (file.exists()) {
            try {
                String provider = mContext.getPackageName() + ".provider";
                Uri path = FileProvider.getUriForFile(mContext, provider, file);
                Intent intent = new Intent(Intent.ACTION_VIEW);
                intent.setDataAndType(path, contentType);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                        | Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                        | Intent.FLAG_GRANT_READ_URI_PERMISSION);
                getReactApplicationContext().startActivity(intent);

                promise.resolve("Open success!!");
            } catch (android.content.ActivityNotFoundException e) {
                promise.reject("Open error!!", e);
            }
        } else {
            promise.reject("File not found");
        }
    }

}
