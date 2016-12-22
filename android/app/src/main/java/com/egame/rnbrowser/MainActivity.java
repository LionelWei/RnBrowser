package com.egame.rnbrowser;

import android.Manifest;
import android.app.AlertDialog;
import android.os.Bundle;

import com.egame.rnbrowser.permission.PermissionUtil;
import com.facebook.react.ReactActivity;

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

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        initWithPermission();
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
        if (mDialog != null) {
            mDialog.dismiss();
        }
    }

    @NeedsPermission({ Manifest.permission.READ_PHONE_STATE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE })
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
            Manifest.permission.WRITE_EXTERNAL_STORAGE })
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
}
