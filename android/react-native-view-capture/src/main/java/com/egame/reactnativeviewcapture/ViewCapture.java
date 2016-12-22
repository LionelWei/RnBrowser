package com.egame.reactnativeviewcapture;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.net.Uri;
import android.util.Log;
import android.view.View;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.NativeViewHierarchyManager;
import com.facebook.react.uimanager.UIBlock;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

import static com.egame.reactnativeviewcapture.ViewCaptureModule.TEMP_FILE_PREFIX;

/*
 * FileName:    ViewCapture.java
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     12/22/16 1.00 初始版本
 */


/*package*/ class ViewCapture implements UIBlock {
    public static final String TAG = "ViewCapture";

    /*package*/ static final String ERROR_UNABLE_TO_SNAPSHOT = "E_UNABLE_TO_SNAPSHOT";

    private ReactApplicationContext context;
    private int tag;
    private String format;
    private Bitmap.CompressFormat compressFormat;
    private double quality;
    private Integer width;
    private Integer height;
    private String fileName;
    private Promise promise;

    /*package*/ ViewCapture(ReactApplicationContext context,
                       int tag,
                       ViewCaptureProps props,
                       Promise promise) {
        this.context = context;
        this.tag = tag;
        this.format = props.format;
        this.compressFormat = props.compressFormat;
        this.quality = props.quality;
        this.width = props.width;
        this.height = props.height;
        this.fileName = props.fileName;
        this.promise = promise;
    }

    @Override
    public void execute(NativeViewHierarchyManager nativeViewHierarchyManager) {
        if (!checkValidity()) {
            return;
        }

        final View view = nativeViewHierarchyManager.resolveView(tag);
        if (view == null) {
            promise.reject(ERROR_UNABLE_TO_SNAPSHOT, "No view found with reactTag: "+tag);
            return;
        }

        final Bitmap rawBitmap = captureViewWithBitmap(view);
        saveBitmap(view, rawBitmap);
    }

    private void saveBitmap(final View view, final Bitmap raw) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                OutputStream os = null;
                try {
                    File file = createTempFile(context, format, fileName);
                    os = new FileOutputStream(file);
                    raw.compress(compressFormat, (int)(100.0 * quality), os);
                    final String uri = Uri.fromFile(file).toString();
                    view.post(new Runnable() {
                        @Override
                        public void run() {
                            promise.resolve(uri);
                        }
                    });
                } catch (IOException e) {
                    e.printStackTrace();
                    view.post(new Runnable() {
                        @Override
                        public void run() {
                            promise.reject(ERROR_UNABLE_TO_SNAPSHOT, "Failed to capture view snapshot");
                        }
                    });
                } finally {
                    if (os != null) {
                        try {
                            os.close();
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }
                }
            }
        }).start();
    }

    /**
     * 截屏并返回对应的bitmap
     */
    private Bitmap captureViewWithBitmap(View view) {
        int w = view.getWidth();
        int h = view.getHeight();
        if (w <= 0 || h <= 0) {
            throw new RuntimeException("Impossible to snapshot the view: view is invalid");
        }
        Bitmap bitmap = Bitmap.createBitmap(view.getWidth(), view.getHeight(), Bitmap.Config.RGB_565);
        Canvas c = new Canvas(bitmap);
        view.draw(c);
        bitmap = Bitmap.createScaledBitmap(bitmap, w / 2, h / 2, true);

//        if (width != null && height != null && (width != w || height != h)) {
//            bitmap = Bitmap.createScaledBitmap(bitmap, width, height, true);
//        }
//        if (bitmap == null) {
//            throw new RuntimeException("Impossible to snapshot the view");
//        }

        return bitmap;
    }

    private boolean checkValidity() {
        if (compressFormat == null) {
            promise.reject(ViewCapture.ERROR_UNABLE_TO_SNAPSHOT,
                    "Unsupported image compressFormat: "
                            + format +". Try one of: png | jpg | jpeg");
            return false;
        }
        return true;
    }

    /**
     * 在缓存目录中创建临时文件
     */
    private File createTempFile(Context context, String ext, String name)
            throws IOException {
        File externalCacheDir = context.getExternalCacheDir();
        File internalCacheDir = context.getCacheDir();
        File cacheDir;
        if (externalCacheDir == null && internalCacheDir == null) {
            throw new IOException("No cache directory available");
        }
        if (externalCacheDir == null) {
            cacheDir = internalCacheDir;
        }
        else if (internalCacheDir == null) {
            cacheDir = externalCacheDir;
        } else {
            cacheDir = externalCacheDir.getFreeSpace() > internalCacheDir.getFreeSpace() ?
                    externalCacheDir : internalCacheDir;
        }
        String suffix = "." + ext;
        File tmpFile = File.createTempFile(TEMP_FILE_PREFIX, suffix, cacheDir);
        if (name != null) {
            File renamed = new File(cacheDir, name + suffix);
            tmpFile.renameTo(renamed);
            return renamed;
        }

        return tmpFile;
    }

}

