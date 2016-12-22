package com.egame.rnbrowser.webview;

import android.app.DownloadManager;
import android.content.Context;
import android.net.Uri;
import android.os.Environment;
import android.util.Log;
import android.webkit.URLUtil;
import android.widget.Toast;

import com.tencent.smtt.sdk.CookieManager;
import com.tencent.smtt.sdk.DownloadListener;
import com.tencent.smtt.sdk.WebView;

import static android.content.Context.DOWNLOAD_SERVICE;



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

    public WebViewDownloadListener(WebView webView) {
        mWebView = webView;
        mContext = mWebView.getContext();
    }

    @Override
    public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
        Log.e(TAG, "onDownloadStart: url: " + url);
        DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));

        request.setMimeType(mimeType);
        //------------------------COOKIE!!------------------------
        String cookies = CookieManager.getInstance().getCookie(url);
        request.addRequestHeader("cookie", cookies);
        //------------------------COOKIE!!------------------------
        request.addRequestHeader("User-Agent", userAgent);
        request.setDescription("Downloading file...");
        request.setTitle(URLUtil.guessFileName(url, contentDisposition, mimeType));
        request.allowScanningByMediaScanner();
        request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
        request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, URLUtil.guessFileName(url, contentDisposition, mimeType));
        DownloadManager dm = (DownloadManager) mContext.getSystemService(DOWNLOAD_SERVICE);
        dm.enqueue(request);
        Toast.makeText(mContext, "开始下载...", Toast.LENGTH_SHORT).show();
    }
}
