package com.egame.reactnativeurldownload;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;



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
        return null;
    }
}
