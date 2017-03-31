package cn.egame.browser.sdk;


/*
 * FileName:    X5TencentSdkProvider.java
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     12/20/16 1.00 初始版本
 */

import android.content.Context;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.util.Log;

import com.egame.reactnativewebview.WebkitChooseModule;
import com.tencent.smtt.sdk.QbSdk;
import com.tencent.smtt.sdk.TbsListener;

/*package*/ class X5TencentSdkProvider implements SdkIntegration.SdkProvider {
    private static final String TAG = "X5SdkProvider";
    private Context mContext;

    /*package*/ X5TencentSdkProvider(Context context) {
        mContext = context.getApplicationContext();
    }

    @Override
    public void setup() {
        SharedPreferences prefs = PreferenceManager
                .getDefaultSharedPreferences(mContext);
        boolean isX5 = prefs.getBoolean(WebkitChooseModule.PREF_IS_X5_WEBKIT, false);
        if (isX5) {
            setupX5();
        }
    }

    private void setupX5() {
        QbSdk.PreInitCallback cb = new QbSdk.PreInitCallback() {

            @Override
            public void onViewInitFinished(boolean arg0) {
                Log.e(TAG, " onViewInitFinished is " + arg0);
            }

            @Override
            public void onCoreInitFinished() {
            }
        };
        QbSdk.setTbsListener(new TbsListener() {
            @Override
            public void onDownloadFinish(int i) {
                Log.d(TAG,"onDownloadFinish");
            }

            @Override
            public void onInstallFinish(int i) {
                Log.d(TAG,"onInstallFinish");
            }

            @Override
            public void onDownloadProgress(int i) {
                Log.d(TAG,"onDownloadProgress:"+i);
            }
        });

        QbSdk.initX5Environment(mContext, cb);
    }
}
