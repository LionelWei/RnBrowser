package com.egame.reactnativeviewcapture;


/*
 * FileName:    ViewCaptureProps.java
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     12/22/16 1.00 初始版本
 */


import android.graphics.Bitmap.CompressFormat;
import android.util.DisplayMetrics;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;

/*package*/ class ViewCaptureProps {
    private final ReactApplicationContext mContext;
    private final ReadableMap mPropMap;
    /*package*/ String format;
    /*package*/ CompressFormat compressFormat;
    /*package*/ double quality;
    /*package*/ int top;
    /*package*/ int left;
    /*package*/ Integer width;
    /*package*/ Integer height;
    /*package*/ String fileName;

    /*package*/ ViewCaptureProps(ReactApplicationContext context, ReadableMap props) {
        mContext = context;
        mPropMap = props;
        parseProps();
    }

    private void parseProps() {
        parseFormat();
        parseQuality();
        parseDimension();
        parseFileName();
    }

    private void parseFormat() {
        format = mPropMap.hasKey("format") ? mPropMap.getString("format") : "png";
        compressFormat = format.equals("png")
                ? CompressFormat.PNG
                : format.equals("jpg") || format.equals("jpeg")
                ? CompressFormat.JPEG
                : format.equals("webm")
                ? CompressFormat.WEBP
                : null;
    }

    private void parseQuality() {
        quality = mPropMap.hasKey("quality")
                ? mPropMap.getDouble("quality")
                : 1.0;
    }

    private void parseDimension() {
        top = mPropMap.hasKey("top") ? (int)mPropMap.getDouble("top") : 0;
        left = mPropMap.hasKey("left") ? (int)mPropMap.getDouble("left") : 0;
        DisplayMetrics displayMetrics = mContext.getResources().getDisplayMetrics();
        width = mPropMap.hasKey("width")
                ? (int)(displayMetrics.density * mPropMap.getDouble("width"))
                : null;
        height = mPropMap.hasKey("height")
                ? (int)(displayMetrics.density * mPropMap.getDouble("height"))
                : null;
    }

    private void parseFileName() {
        fileName = mPropMap.hasKey("filename") ? mPropMap.getString("filename") : null;
    }
}
