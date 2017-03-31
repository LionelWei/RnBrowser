package cn.egame.browser.task;


/*
 * FileName:    Task.java
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     3/15/17 1.00 初始版本
 */


import android.content.Context;

public interface Task {
    void startAction(Context context);
    void cancelAction(Context context);
}
