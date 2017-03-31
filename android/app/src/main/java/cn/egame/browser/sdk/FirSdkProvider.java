package cn.egame.browser.sdk;


/*
 * FileName:    FirSdkProvider.java
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     3/23/17 1.00 初始版本
 */


import android.content.Context;

import im.fir.sdk.FIR;

/*package*/ class FirSdkProvider implements SdkIntegration.SdkProvider {
    private Context mContext;

    /*package*/ FirSdkProvider(Context context) {
        this.mContext = context.getApplicationContext();
    }

    @Override
    public void setup() {
        FIR.init(mContext);
    }
}
