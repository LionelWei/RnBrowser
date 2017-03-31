package cn.egame.browser;

import android.app.Application;
import android.content.Context;
import android.util.Log;

import com.RNFetchBlob.RNFetchBlobPackage;
import com.egame.reactnativecaptureview.ReactCaptureViewPackage;
import com.egame.reactnativecheckupadte.CheckUpdatePackage;
import com.egame.reactnativefilelauncher.FileLauncherPackage;
import com.egame.reactnativewebview.WebViewPackage;

import cn.egame.browser.sdk.SdkIntegration;

import com.facebook.react.ReactApplication;
import com.microsoft.codepush.react.CodePush;
import com.rnfs.RNFSPackage;
import com.fileopener.FileOpenerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

        @Override
        protected String getJSBundleFile() {
            return CodePush.getJSBundleFile();
        }


        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.RN_DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
                    new CodePush(getResources().getString(
                            R.string.reactNativeCodePush_androidDeploymentKey),
                            getApplicationContext(),
                            BuildConfig.RN_DEBUG),
                    new RNFSPackage(),
                    new FileLauncherPackage(),
                    new RNFetchBlobPackage(),
                    new WebViewPackage(),
                    new ReactCaptureViewPackage(),
                    new CheckUpdatePackage()
            );
        }
    };

    private static Context sContext;

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        sContext = this;
        Log.e("MainApplication", "onCreate: main thread");
        SdkIntegration.integrate(this);
    }

    public static Context getContext() {
        return sContext;
    }
}
