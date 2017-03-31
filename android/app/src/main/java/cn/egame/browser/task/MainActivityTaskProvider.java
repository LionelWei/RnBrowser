package cn.egame.browser.task;


/*
 * FileName:    MainActivityTaskProvider.java
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     3/15/17 1.00 初始版本
 */


import java.util.Arrays;
import java.util.List;

public class MainActivityTaskProvider extends TaskProvider {
    public MainActivityTaskProvider() {
        mTasks = Arrays.<Task>asList(
                new NetWorkBroadcastTask(),
                new TrafficStatsTask()
        );
    }
}
