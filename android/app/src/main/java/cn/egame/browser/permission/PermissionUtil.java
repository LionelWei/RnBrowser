package cn.egame.browser.permission;

/*
 * FileName:
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     8/1/16 1.00 初始版本
 */

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.pm.PackageManager;
import android.support.annotation.NonNull;
import android.support.v4.content.ContextCompat;

import permissions.dispatcher.PermissionRequest;

public class PermissionUtil {

    public static final int REQUEST_CODE_BROWSER = 1;

    public static boolean hasBasicPermission(Context context) {
        boolean hasPhonePermission = ContextCompat.checkSelfPermission(context,
                Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED;
        boolean hasStoragePermission = ContextCompat.checkSelfPermission(
                context, Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED;
        return hasPhonePermission && hasStoragePermission;
    }

    public static AlertDialog showRationaleDialog(Context context,
                                                  String message, final PermissionRequest request) {
        return new AlertDialog.Builder(context)
                .setPositiveButton("确认", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(@NonNull DialogInterface dialog,
                            int which) {
                        request.proceed();
                    }
                })
                .setNegativeButton("取消", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(@NonNull DialogInterface dialog,
                            int which) {
                        request.cancel();
                    }
                }).setCancelable(false).setMessage(message).show();
    }

    public static AlertDialog showNeverAskDialog(final Activity context, String message) {
        return new AlertDialog.Builder(context)
                .setPositiveButton("确认", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        dialog.dismiss();
                        context.finish();
                    }
                }).setCancelable(false).setMessage(message).show();
    }

}
