package com.egame.reactnativewebview.events;


/*
 * FileName:    UpdateLoadingProgressEvent.java
 * Copyright:   炫彩互动网络科技有限公司
 * Author:      weilai
 * Description: <文件描述>
 * History:     1/11/17 1.00 初始版本
 */


import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.Event;
import com.facebook.react.uimanager.events.RCTEventEmitter;

public class UpdateLoadingProgressEvent extends Event<UpdateLoadingProgressEvent> {
    public static final String EVENT_NAME = "updateLoadingProgress";
    private WritableMap mEventData;

    public UpdateLoadingProgressEvent(int viewId, WritableMap eventData) {
        super(viewId);
        mEventData = eventData;
    }

    @Override
    public String getEventName() {
        return EVENT_NAME;
    }

    @Override
    public boolean canCoalesce() {
        return false;
    }

    @Override
    public short getCoalescingKey() {
        // All events for a given view can be coalesced.
        return 0;
    }

    @Override
    public void dispatch(RCTEventEmitter rctEventEmitter) {
        rctEventEmitter.receiveEvent(getViewTag(), getEventName(), mEventData);
    }
}
