package com.egame.reactnativeurldownload;


/*
 * FileName:    UrlDownloadUtils.java
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     12/22/16 1.00 初始版本
 */


public class UrlDownloadUtils {
    private final static String[] SUFFIX_LIST = {"apk", "zip", "rar", "avi", "mp3", "mp4"};


    public static boolean isUrlDownloadable(String url) {
        for (String suffix : SUFFIX_LIST) {
            if (url.endsWith(suffix)) {
                return true;
            }
        }
        return false;
    }
}
