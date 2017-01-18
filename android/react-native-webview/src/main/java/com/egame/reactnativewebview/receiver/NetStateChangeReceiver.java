package com.egame.reactnativewebview.receiver;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.egame.reactnativewebview.eventbus.ProxyAsPerNetworkEvent;
import com.egame.reactnativewebview.util.NetworkUtil;

import org.greenrobot.eventbus.EventBus;


public class NetStateChangeReceiver extends BroadcastReceiver {
    public static final String TAG = "NetStateChangeReceiver";

    public NetStateChangeReceiver() {
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        String action;
        if (intent != null ) {
            action = intent.getAction();
            if (action.equals("android.net.conn.CONNECTIVITY_CHANGE")) {
                handleNetworkStatusChange(context);
            }
        }
    }

    private void handleNetworkStatusChange(Context context) {
        boolean canTurnOnProxy = NetworkUtil.canTurnOnProxy(context);
        Log.e(TAG, "handleNetworkStatusChange: canTurnOnProxy: " + canTurnOnProxy);
        EventBus.getDefault().post(new ProxyAsPerNetworkEvent(canTurnOnProxy));
    }
}
