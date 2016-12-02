/*
 * @flow */

import React, {PropTypes, Component } from 'react';
import {
  WebView,
  View,
  Text,
  Dimensions,
  StyleSheet
} from 'react-native';
import {NAV_BAR_HEIGHT ,BOTTOM_BAR_HEIGHT} from '../utils/Consts'

var {height, width} = Dimensions.get('window');
height -= NAV_BAR_HEIGHT + BOTTOM_BAR_HEIGHT;

import {connect} from 'react-redux'
import {Emitter} from '../events/Emitter'
import Web from './Web'
import {printObj} from '../utils/Common'

class TabController extends Component {
  state = {
    tabList: [ {
        id: 0,
        view: <View key={0} style={styles.overlay}>
                <Web id={0} key={0}/>
              </View>
      }
    ],
    /*记录tab的个数, 目前是单调递增的, 即使删除一个tab再创建也会加1*/
    tabCount: 1,
    currentTabId: 0,
  }

  constructor(props: any) {
    super(props);
    this.initEvent();
  }

  render() {
    let newTabList = this.showCurrentTabAtFront();
    return (
      <View style={{width: width, height: height}}>
        {
          newTabList.map((elem, index) => {
            return elem.view;
          })
        }
      </View>
    )
  }

  showCurrentTabAtFront() {
    var currentId: number = this.state.currentTabId;
    var excludeCurrentTabList = this.state.tabList.filter((elm, index) => {
      return elm.id != currentId;
    });
    return [...excludeCurrentTabList, this.findViewByTabId(currentId)];
  }

  findViewByTabId(tabId): any {
    for (var i in this.state.tabList) {
      if (tabId === this.state.tabList[i].id) {
        return this.state.tabList[i]
      }
    }
  }

  findIndexByTabId(tabId) {
    for (var i in this.state.tabList) {
      if (tabId === this.state.tabList[i].id) {
        return i;
      }
    }
  }

  initEvent() {
    Emitter.addListener('add_tab', (...args) => {
      this.appendWeb();
    })

    Emitter.addListener('switch_tab', (...args) => {
      var id = args[0];
      this.switchWeb(id);
    })

    Emitter.addListener('close_tab', (...args) => {
      var id = args[0];
      this.closeWeb(id);
    })
  }

  appendWeb() {
    var primaryId = this.state.tabCount;
    this.setState({
      tabList: [
        ...this.state.tabList,
        {
          id: primaryId,
          view: <View key={primaryId} style={styles.overlay}>
                  <Web id={primaryId} key={primaryId}/>
                </View>
        }
      ],
      tabCount: this.state.tabCount + 1,
      currentTabId: primaryId
    })
  }

  switchWeb(id: number) {
    this.setState({
      currentTabId: id
    })
  }

  closeWeb(id: number) {
    if (this.state.tabList.length == 1) {
      return;
    }

    var tempList = this.state.tabList.slice();
    console.log('id: ' + id + ', tempList: ' + tempList.length);

    var currentId = this.state.currentTabId;
    var nearest = findNearestElement(tempList, id);
    var toDeleteId = this.findIndexByTabId(id)
    if (toDeleteId || toDeleteId === 0) {
      console.log('toDeleteId ' + toDeleteId);
      tempList.splice(toDeleteId, 1);
    }

    this.setState({
      tabList: tempList,
      currentTabId: nearest
    })

    console.log('==== _closeWeb switchTab: ' + nearest);
    Emitter.emit('switch_tab', nearest);

    function findNearestElement(arr, id) {
      var prev = -1, cur = -1, next = -1;
      var foundPrev = false;
      for (var i = 0; i < arr.length; i++) {
        var viewId = arr[i].id;
        if (foundPrev) {
          next = viewId;
          break;
        }
        if (viewId === id) {
          if (prev === -1) {
            prev = viewId;
            next = viewId;
          }
          foundPrev = true;
        }
        if (!foundPrev) {
          prev = viewId;
        }
      }

      if (prev === next) {
        return prev;
      }
      if (prev === id) {
        return next
      }
      return prev
    }

  }
}

const styles = StyleSheet.create({
  overlay:{
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }
})

function mapDispatchToProps(dispatch) {
  return {
  }
}

module.exports = connect(
  null,
  mapDispatchToProps)(TabController)
