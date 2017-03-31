package cn.egame.browser.task;


/*
 * FileName:    TrafficStatsTask.java
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     3/15/17 1.00 初始版本
 */


import android.content.Context;

import com.egame.reactnativewebview.util.TrafficStatsUtil;

public class TrafficStatsTask implements Task {
    @Override
    public void startAction(Context context) {
        TrafficStatsUtil.updateTrafficStatsOnCreate(context);
    }

    @Override
    public void cancelAction(Context context) {
        TrafficStatsUtil.updateTrafficStatsOnDestroy(context);
    }
}
