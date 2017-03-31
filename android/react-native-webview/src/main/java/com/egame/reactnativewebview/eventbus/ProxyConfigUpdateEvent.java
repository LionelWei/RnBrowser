package com.egame.reactnativewebview.eventbus;


/*
 * FileName:    ProxyConfigUpdateEvent.java
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     1/4/17 1.00 初始版本
 */


public class ProxyConfigUpdateEvent {
    public String proxyIp;
    public int proxyPort;
    public String authName;
    public String authPwd;
    public boolean isProxyEnabled;

    public ProxyConfigUpdateEvent(boolean isProxyEnabled) {
        this.isProxyEnabled = isProxyEnabled;
    }

    public ProxyConfigUpdateEvent(
            boolean isProxyEnabled,
            String proxyIp,
            int proxyPort,
            String authName,
            String authPwd) {
        this.isProxyEnabled = isProxyEnabled;
        this.proxyIp = proxyIp;
        this.proxyPort = proxyPort;
        this.authName = authName;
        this.authPwd = authPwd;
    }
}
