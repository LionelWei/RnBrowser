package com.egame.rnbrowser.sdk;


/*
 * FileName:    SdkIntegration.java
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     12/20/16 1.00 初始版本
 */

import android.content.Context;

import java.util.Arrays;
import java.util.List;

public class SdkIntegration {
    /*package*/ interface SdkProvider {
        void setup();
    }

    public static void integrate(Context context) {
        for (SdkProvider provider : getProviders(context)) {
            provider.setup();
        }
    }

    private static List<SdkProvider> getProviders(Context context) {
        return Arrays.<SdkProvider>asList(
                new X5TencentSdkProvider(context)
        );
    }
}
