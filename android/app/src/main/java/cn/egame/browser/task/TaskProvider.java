package cn.egame.browser.task;


/*
 * FileName:    TaskProvider.java
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     3/15/17 1.00 初始版本
 */


import android.content.Context;

import java.util.List;

public abstract class TaskProvider {
    protected List<Task> mTasks;

    public void startTasks(Context context) {
        if (mTasks != null) {
            for (Task task: mTasks) {
                task.startAction(context);
            }
        }
    }

    public void cancelTasks(Context context) {
        if (mTasks != null) {
            for (Task task: mTasks) {
                task.cancelAction(context);
            }
        }
    }

}
