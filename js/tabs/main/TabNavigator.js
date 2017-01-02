/*
 * @flow */

import React, {PropTypes, Component } from 'react';
import {
  View,
  Text,
  Dimensions,
  Navigator,
  StyleSheet,
  Platform,
  WebView
} from 'react-native';
import {
  STATUS_BAR_HEIGHT,
  NAV_BAR_HEIGHT,
  BOTTOM_BAR_HEIGHT}
from '../../utils/Consts'

import {connect} from 'react-redux'
import {Emitter} from '../../events/Emitter'
import TabPage from './TabPage'
import WebPage from '../web/WebPage'

class TabNavigator extends Component {

  navigator = {}
  currentPage = {};

  unMounted = false;

  componentWillUnmount() {
    this.unMounted = true;
  }

  back = () => {
    const navigator = this.navigator
    const routers = navigator.getCurrentRoutes();
    if (routers.length > 1) {
      // 如果是web页面, 返回上一级
      // 这里需要添加类型检测逻辑 (默认按照Connect Component处理)
      this.currentPage.getWrappedInstance().back
        && this.currentPage.getWrappedInstance().back()
      return true;
    }
    return false
  }

  getTitleText = () => {
    return this.currentPage.getWrappedInstance().getTitleText
      && this.currentPage.getWrappedInstance().getTitleText() || ''
  }

  render() {
    return (
      <View style={{
        flex: 1,
        backgroundColor: 'white'}}>
        <View style={styles.statusbar_padding}/>
        <Navigator
          style={styles.container}
          ref={(navigator) => this.navigator = navigator}
          initialRoute={{
            component: TabPage,
            id: this.props.id,
            menuPressFn: this.props.menuPressFn,
            tabPressFn: this.props.tabPressFn,
          }}
          configureScene={this.configureScene}
          renderScene={(route, navigator) => {
            return <route.component
                      ref={(component) => this.currentPage = component}
                      navigator={navigator}
                      {...route}
                      {...route.passProps}/>
          }}
        />
      </View>
    )
  }

  configureScene (route: Object) {
    return route.scene || Navigator.SceneConfigs.PushFromRight
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusbar_padding: {
    height: Platform.OS === 'ios' ? STATUS_BAR_HEIGHT : 0
  }
})

module.exports = TabNavigator;
