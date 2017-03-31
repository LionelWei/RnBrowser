package com.egame.reactnativecheckupadte;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;



/*
 * FileName:    CheckUpdatePackage.java
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     3/23/17 1.00 初始版本
 */


public class CheckUpdatePackage implements ReactPackage {
    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        return Arrays.<NativeModule>asList(
                new FirCheckUpdateModule(reactContext)
        );

    }

    @Override
    public List<Class<? extends JavaScriptModule>> createJSModules() {
        return Collections.emptyList();
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
