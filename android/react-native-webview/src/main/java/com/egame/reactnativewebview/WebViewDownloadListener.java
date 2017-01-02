package com.egame.reactnativewebview;

import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.database.Cursor;
import android.net.Uri;
import android.util.Log;
import android.webkit.URLUtil;
import android.widget.Toast;

import com.egame.reactnativewebview.events.StartDownloadEvent;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.tencent.smtt.sdk.DownloadListener;
import com.tencent.smtt.sdk.WebView;



/*
 * FileName:    WebViewDownloadListener.java
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     12/22/16 1.00 初始版本
 */


public class WebViewDownloadListener implements DownloadListener {
    private final static String TAG = "WebViewDownloadListener";
    private final WebView mWebView;
    private final Context mContext;
    private DownloadManager mDownloadManager;
    private long mDownloadedFileID;

    public WebViewDownloadListener(WebView webView) {
        mWebView = webView;
        mContext = mWebView.getContext();
    }

    @Override
    public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
        Log.e(TAG, "onDownloadStart: url: " + url);

        String title = URLUtil.guessFileName(url, contentDisposition, mimeType);
        ReactWebViewManager.dispatchEvent(
                mWebView,
                new StartDownloadEvent(
                        mWebView.getId(),
                        createStartDownloadEvent(mWebView, title, url)));
//
//        setupDownloadReceiver();
//        DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
//
//        request.setMimeType(mimeType);
//        //------------------------COOKIE!!------------------------
//        String cookies = CookieManager.getInstance().getCookie(url);
//        request.addRequestHeader("cookie", cookies);
//        //------------------------COOKIE!!------------------------
//        request.addRequestHeader("User-Agent", userAgent);
//        request.setDescription("Downloading file...");
//        request.setTitle(URLUtil.guessFileName(url, contentDisposition, mimeType));
//        request.allowScanningByMediaScanner();
//        request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
//        request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, URLUtil.guessFileName(url, contentDisposition, mimeType));
//        mDownloadManager = (DownloadManager) mContext.getSystemService(DOWNLOAD_SERVICE);
//        mDownloadedFileID = mDownloadManager.enqueue(request);
//        Toast.makeText(mContext, "开始下载...", Toast.LENGTH_SHORT).show();
    }

    private WritableMap createStartDownloadEvent(WebView webView, String title, String url) {
        WritableMap event = Arguments.createMap();
        event.putDouble("target", webView.getId());
        event.putString("url", url);
        event.putString("title", title);
        return event;
    }

    private void setupDownloadReceiver() {
        // Function is called once download completes.
        final BroadcastReceiver onComplete = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                Long inDownloadId = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, 0);

                Log.e(TAG, "onReceive: downloadId: " + inDownloadId);
                if (mDownloadedFileID == -1 || mDownloadedFileID != inDownloadId) {
                    return;
                }

                String filePath = null;
                DownloadManager.Query query = new DownloadManager.Query();
                query.setFilterById(mDownloadedFileID);
                Cursor c = mDownloadManager.query(query);
                if (c.moveToFirst()) {
                    int columnIndex = c.getColumnIndex(DownloadManager.COLUMN_STATUS);
                    // 下载失败也会返回这个广播，所以要判断下是否真的下载成功
                    if (DownloadManager.STATUS_SUCCESSFUL == c.getInt(columnIndex)) {
                        // 获取下载好的 apk 路径
                        filePath = c.getString(c.getColumnIndex(DownloadManager.COLUMN_LOCAL_FILENAME));
                    }
                }

                Log.e(TAG, "onReceive: filePath: " + filePath);

//                Uri mostRecentDownload =
//                        mDownloadManager.getUriForDownloadedFile(mDownloadedFileID);
                String mimeType =
                        mDownloadManager.getMimeTypeForDownloadedFile(mDownloadedFileID);

//                Log.e(TAG, "onReceive: mostRecentDownload: " + mostRecentDownload.getPath() + ", mimeType: " + mimeType);
                Intent fileIntent = new Intent(Intent.ACTION_VIEW);
                fileIntent.setDataAndType(Uri.parse("file://" + filePath), mimeType);
                fileIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

                try {
                    mContext.startActivity(fileIntent);
                } catch (ActivityNotFoundException e) {
                    Toast.makeText(mContext, "No handler for this type of file.",
                            Toast.LENGTH_SHORT).show();
                }
                mDownloadedFileID = -1;
            }
        };

        // TODO 需要unRegister 防止内存泄漏
        mContext.registerReceiver(onComplete, new
                IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE));
    }
}
