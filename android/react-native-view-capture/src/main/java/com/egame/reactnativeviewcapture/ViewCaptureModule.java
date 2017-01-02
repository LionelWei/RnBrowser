package com.egame.reactnativeviewcapture;

import android.content.Context;
import android.os.AsyncTask;
import android.util.Log;

import com.facebook.react.bridge.GuardedAsyncTask;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.UIManagerModule;

import java.io.File;
import java.io.FilenameFilter;

/*
 * FileName:    ViewCaptureModule.java
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     12/22/16 1.00 初始版本
 */


/*package*/ class ViewCaptureModule extends ReactContextBaseJavaModule {
    public static final String TAG = "ViewCaptureModule";
    /*package*/ static final String TEMP_FILE_PREFIX = "ReactNative_snapshot_image_";

    private final ReactApplicationContext mReactContext;

    /*package*/ ViewCaptureModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.mReactContext = reactContext;
    }

    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        new CleanTask(getReactApplicationContext()).executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);
    }

    @Override
    public String getName() {
        return "ViewCapture";
    }

    @ReactMethod
    public void capture(int tag, ReadableMap options, Promise promise) {
        Log.e(TAG, "capture: tag: " + tag);
        ViewCaptureProps props = new ViewCaptureProps(mReactContext, options);
        UIManagerModule uiManager = mReactContext.getNativeModule(UIManagerModule.class);
        uiManager.addUIBlock(new ViewCapture(mReactContext, tag, props, promise));
        Log.e(TAG, "capture: end");
    }

    /**
     * 用于清理缓存目录中图片文件的异步任务,
     * 当Catalyst实例被销毁时执行(比如关闭APP或者APP崩溃时).
     */
    private static class CleanTask extends GuardedAsyncTask<Void, Void> {
        private final Context mContext;

        private CleanTask(ReactContext context) {
            super(context);
            mContext = context;
        }

        @Override
        protected void doInBackgroundGuarded(Void... params) {
            cleanDirectory(mContext.getCacheDir());
            File externalCacheDir = mContext.getExternalCacheDir();
            if (externalCacheDir != null) {
                cleanDirectory(externalCacheDir);
            }
        }

        private void cleanDirectory(File directory) {
            File[] toDelete = directory.listFiles(
                    new FilenameFilter() {
                        @Override
                        public boolean accept(File dir, String filename) {
                            return filename.startsWith(TEMP_FILE_PREFIX);
                        }
                    });
            if (toDelete != null) {
                for (File file: toDelete) {
                    file.delete();
                }
            }
        }
    }
}
