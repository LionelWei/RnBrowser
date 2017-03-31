package com.egame.reactnativecaptureview;


/*
 * FileName:    ReactCaptureViewManager.java
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     12/29/16 1.00 初始版本
 */

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.NativeViewHierarchyManager;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.UIBlock;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.util.Locale;

import javax.annotation.Nullable;

@ReactModule(name = ReactCaptureViewManager.REACT_CLASS)
public class ReactCaptureViewManager extends SimpleViewManager<ImageView> {
    protected static final String REACT_CLASS = "CaptureView";
    private static final String TAG = REACT_CLASS;
    private ReactContext mReactContext;
    private boolean mIsDirty = false;
    private int mTag;
    private int mStartX;
    private int mStartY;
    private int mWidth;
    private int mHeight;

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected ImageView createViewInstance(ThemedReactContext reactContext) {
        mReactContext = reactContext;
        return new ImageView(reactContext, null);
    }

    @ReactProp(name = "tag")
    public void setViewTag(ImageView view, int tag) {
        Log.e(TAG, "setViewTag: " + tag);
        mTag = tag;
        mIsDirty = true;
    }

    @ReactProp(name = "tagWithRect")
    public void setViewTagWithRect(ImageView view, @Nullable ReadableMap source) {
        if (source == null) {
            return;
        }
        if (!source.hasKey("tag")
            || !source.hasKey("x")
            || !source.hasKey("y")
            || !source.hasKey("w")
            || !source.hasKey("h")) {
            return;
        }

        mIsDirty = true;
        mTag = source.getInt("tag");
        mStartX = (int) source.getDouble("x");
        mStartY = (int) source.getDouble("y");
        mWidth = (int) source.getDouble("w");
        mHeight = (int) source.getDouble("h");
    }

    private static class CaptureViewUIBlock implements UIBlock {
        ImageView mImageView;
        ReactContext mContext;
        int tag;
        boolean hasSizeSpec;
        int x, y, w, h;
        CaptureViewUIBlock(ImageView imageView, ReactContext context, int viewTag) {
            mImageView = imageView;
            mContext = context;
            tag = viewTag;
            hasSizeSpec = false;
        }

        CaptureViewUIBlock(ImageView imageView,
                           ReactContext context,
                           int viewTag,
                           int x,
                           int y,
                           int w,
                           int h) {
            mImageView = imageView;
            mContext = context;
            tag = viewTag;
            this.x = dp2px(x);
            this.y = dp2px(y);
            this.w = dp2px(w);
            this.h = dp2px(h);
            hasSizeSpec = true;
        }

        @Override
        public void execute(NativeViewHierarchyManager nativeViewHierarchyManager) {
            Log.e(TAG, "execute: tag: " + tag);
            final View view = nativeViewHierarchyManager.resolveView(tag);
            final Bitmap bitmap = captureViewWithBitmap(view);
            mImageView.setImageBitmap(bitmap);
        }

        /**
         * 截屏并返回对应的bitmap
         */
        private Bitmap captureViewWithBitmap(View view) {
            int width = view.getWidth();
            int height = view.getHeight();
            if (width <= 0 || height <= 0) {
                throw new RuntimeException("Impossible to snapshot the view: view is invalid");
            }

            // 先在画布上画出bitmap, 然后再对该bitmap作变换
            Log.e(TAG, "captureViewWithBitmap: width: " + width + ", height: " + height);
            Bitmap raw = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565);
            Canvas c = new Canvas(raw);
            view.draw(c);

            Bitmap bitmap;
            if (hasSizeSpec) {
                String rect = String.format(Locale.getDefault(),
                        "x: %d, y: %d, w: %d, h: %d", x, y, w, h);
                Log.e(TAG, "captureViewWithBitmap: " + rect);
                bitmap = Bitmap.createBitmap(raw, x, y, w, h);
            } else{
                bitmap = raw;
            }

            return bitmap;
        }

        private int dp2px(float dpValue) {
            final float scale = mContext.getResources().getDisplayMetrics().density;
            return (int) (dpValue * scale + 0.5f);
        }

    }

    @Override
    protected void onAfterUpdateTransaction(ImageView view) {
        if (!mIsDirty) {
            return;
        }
        if (mWidth == 0 || mHeight == 0) {
            return;
        }
        UIManagerModule uiManager = mReactContext.getNativeModule(UIManagerModule.class);
        uiManager.addUIBlock(new CaptureViewUIBlock(view,
                mReactContext,
                mTag,
                mStartX,
                mStartY,
                mWidth,
                mHeight));
        mIsDirty = false;
    }
}
