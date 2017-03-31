package cn.egame.browser.task;


/*
 * FileName:    NetWorkBroadcastTask.java
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     3/15/17 1.00 初始版本
 */


import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.IntentFilter;

import com.egame.reactnativewebview.receiver.NetStateChangeReceiver;

public class NetWorkBroadcastTask implements Task {
    private BroadcastReceiver mReceiver;

    @Override
    public void startAction(Context context) {
        IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction("android.net.conn.CONNECTIVITY_CHANGE");
        mReceiver = new NetStateChangeReceiver();
        context.registerReceiver(mReceiver, intentFilter);
    }

    @Override
    public void cancelAction(Context context) {
        context.unregisterReceiver(mReceiver);
    }
}
