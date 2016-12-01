/*
 * @flow */

import React, {PropTypes, Component } from 'react';
import {
  WebView,
  View,
  Text
} from 'react-native';

import {connect} from 'react-redux'
import {Emitter} from '../events/Emitter'
import Web from './Web'
import {printObj} from '../utils/Common'

class WebController extends Component {
  state = {
    tabList: [
      <Web id={0} key={0}/>,
    ],
    /*记录tab的个数, 目前是单调递增的, 即使删除一个tab再创建也会加1*/
    tabCount: 1,
    currentTabId: 0,
  }

  constructor(props: any) {
    super(props);
    this._initEvent();
  }

  render() {
    var currentId: number = this.state.currentTabId;
    console.log('currentTabId: ' + currentId + ', count: ' + this.state.tabList.length);
    return (
      <View style={{flex: 1}}>
        {this.state.tabList[currentId]}
      </View>
    )
  }

  _initEvent() {
    Emitter.addListener('add_tab', (...args) => {
      this._appendWeb();
    })

    Emitter.addListener('switch_tab', (...args) => {
      var id = args[0];
      this._switchWeb(id);
    })

    Emitter.addListener('close_tab', (...args) => {
      var id = args[0];
      this._closeWeb(id);
    })
  }

  _appendWeb() {
    var primaryId = this.state.tabCount;
    this.setState({
      tabList: [
        ...this.state.tabList,
        <Web id={primaryId} key={primaryId}/>
      ],
      tabCount: this.state.tabCount + 1,
      currentTabId: primaryId
    })
  }

  _switchWeb(id: number) {
    this.setState({
      currentTabId: id
    })
  }

  _closeWeb(id: number) {
    var tempList = this.state.tabList.slice();
    console.log('id: ' + id + ', tempList: ' + tempList.length);
    if (true) {
      tempList.splice(id, 1);
      console.log('temp: ' + tempList.length);
      this.setState({
        tabList: tempList,
        currentTabId: 0
      })
      return null;
    }

    var currentId = this.state.currentTabId;
    var nearest = findNearestElement(tempList, currentId);
    tempList.splice(id, 1);

    this.setState({
      tabList: tempList,
      currentTabId: nearest
    })

    function findNearestElement(arr, id) {
      var prev = -1, cur = -1, next = -1;
      var foundPrev = false;
      for (var i = 0; i < arr.length; i++) {
        if (foundPrev) {
          next = arr[i];
          break;
        }
        if (arr[i] === id) {
          if (prev === -1) {
            prev = arr[i];
            next = arr[i];
          }
          foundPrev = true;
        }
        if (!foundPrev) {
          prev = arr[i];
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

function mapDispatchToProps(dispatch) {
  return {
  }
}

module.exports = connect(
  null,
  mapDispatchToProps)(WebController)
