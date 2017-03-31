package com.egame.reactnativecaptureview;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;



/*
 * FileName:    ReactCaptureViewPackage.java
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     12/29/16 1.00 初始版本
 */


public class ReactCaptureViewPackage implements ReactPackage {
    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }

    @Override
    public List<Class<? extends JavaScriptModule>> createJSModules() {
        return Collections.emptyList();
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Arrays.<ViewManager>asList(new ReactCaptureViewManager());
    }
}
