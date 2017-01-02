package com.egame.rnbrowser;

import android.app.Application;
import android.util.Log;

import com.RNFetchBlob.RNFetchBlobPackage;
import com.egame.reactnativecaptureview.CaptureViewPackge;
import com.egame.reactnativeurldownload.UrlDownloadPackage;
import com.egame.reactnativeviewcapture.ViewCapturePackage;
import com.egame.reactnativewebview.WebViewPackage;
import com.egame.rnbrowser.sdk.SdkIntegration;
import com.facebook.react.ReactApplication;
import fr.greweb.reactnativeviewshot.RNViewShotPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

        @Override
        protected boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                new MainReactPackage(),
                new RNViewShotPackage(),
                new RNFetchBlobPackage(),
                new WebViewPackage(),
                new ViewCapturePackage(),
                new UrlDownloadPackage(),
                new CaptureViewPackge()
            );
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Log.e("MainApplication", "onCreate: main thread");
        SdkIntegration.integrate(this);
    }
}
