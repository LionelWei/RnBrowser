package cn.egame.browser;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.BroadcastReceiver;
import android.content.IntentFilter;
import android.net.TrafficStats;
import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;

import cn.egame.browser.permission.PermissionUtil;

import com.egame.reactnativewebview.NativeWebViewProxySetting;
import com.egame.reactnativewebview.eventbus.ProxyAsPerNetworkEvent;
import com.egame.reactnativewebview.receiver.NetStateChangeReceiver;
import com.egame.reactnativewebview.util.TrafficStatsUtil;
import com.facebook.react.ReactActivity;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;

import java.util.List;

import cn.egame.browser.task.MainActivityTaskProvider;
import cn.egame.browser.task.Task;
import cn.egame.browser.task.TaskProvider;
import permissions.dispatcher.NeedsPermission;
import permissions.dispatcher.OnNeverAskAgain;
import permissions.dispatcher.OnPermissionDenied;
import permissions.dispatcher.OnShowRationale;
import permissions.dispatcher.PermissionRequest;
import permissions.dispatcher.RuntimePermissions;


@RuntimePermissions
public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "RnBrowser";
    }

    private boolean isInitWithPermission = false;
    private boolean isResumed = false;
    private AlertDialog mDialog;
    private TaskProvider mTaskProvider = new MainActivityTaskProvider();
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setStatusBarColor(this, R.color.statusBarColor);
        initWithPermission();
        EventBus.getDefault().register(this);
        mTaskProvider.startTasks(this);
    }

    @Subscribe
    public void onNetworkStateUpdate(ProxyAsPerNetworkEvent event) {
        if (event.isOn) {
            TrafficStatsUtil.updateTrafficStatsWhenNetworkChange(this);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        isResumed = false;
    }

    @Override
    protected void onResume() {
        super.onResume();
        isResumed = true;
        resumeWithPermission();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        EventBus.getDefault().unregister(this);
        if (mDialog != null) {
            mDialog.dismiss();
        }
        mTaskProvider.cancelTasks(this);
    }

    @NeedsPermission({ Manifest.permission.READ_PHONE_STATE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE,
            Manifest.permission.ACCESS_FINE_LOCATION})
    /*package*/void init() {
        isInitWithPermission = false;
        onInitWithPermission();
        if (isResumed) {
            resumeWithPermission();
        }
    }

    protected void initWithPermission() {
        isInitWithPermission = true;
        MainActivityPermissionsDispatcher.initWithCheck(this);
    }

    protected void resumeWithPermission() {
        if (!isInitWithPermission) {
            MainActivityPermissionsDispatcher.resumeWithCheck(this);
        }
    }

    protected void onInitWithPermission() {
    }

    @NeedsPermission({ Manifest.permission.READ_PHONE_STATE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE,
            Manifest.permission.ACCESS_FINE_LOCATION})
    /*package*/void resume() {
        isInitWithPermission = false;
        onResumeWithPermission();
    }

    protected void onResumeWithPermission() {
    }

    @OnShowRationale({ Manifest.permission.READ_PHONE_STATE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE })
    protected void showRationale(PermissionRequest request) {
        mDialog = PermissionUtil.showRationaleDialog(this,
                "浏览器需要获取手机状态信息并读取存储卡内容", request);
    }

    @OnPermissionDenied({ Manifest.permission.READ_PHONE_STATE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE })
    protected void showDenied() {
        finish();
    }

    @OnNeverAskAgain({ Manifest.permission.READ_PHONE_STATE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE })
    protected void showNeverAsk() {
        mDialog = PermissionUtil.showNeverAskDialog(this, "浏览器需要获取手机状态信息并读取存储卡内容");
    }

    @Override
    public void onRequestPermissionsResult(int requestCode,
                                           String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        // NOTE: delegate the permission handling to generated method
        MainActivityPermissionsDispatcher.onRequestPermissionsResult(this,
                requestCode, grantResults);
    }


    private void setStatusBarColor(Activity activity, int colorResId) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                Window window = activity.getWindow();
                window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
                window.setStatusBarColor(activity.getResources().getColor(colorResId));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
