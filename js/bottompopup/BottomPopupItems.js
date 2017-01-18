/* @flow */

import React, { Component, PropTypes } from 'react'

import {
  Image,
  View,
  Text,
  StyleSheet,
  TextInput,
  Platform,
  AsyncStorage
} from 'react-native'
import DownloadManagerPage from '../download/DownloadManagerPage'
import TabManagePage from '../tabs/manage/TabManagePage'
import BookBarPage from '../bookbar/BookBarPage'
import SettingPage from '../setting/SettingPage'

import {connect} from 'react-redux'
import TouchableButton from '../components/TouchableButton'
import {BOTTOM_BAR_HEIGHT} from '../utils/Consts'
import {Emitter} from '../events/Emitter'
import * as IMG from '../assets/imageAssets'
import Transitions from '../animation/NavigatorAnimation'
import {foo, bar} from '../nativemodules/UrlDownload'


const style = StyleSheet.create({
  basic: {
    flex: 1,
    flexDirection: 'column',
  },
  menu_content: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  menu_bottom: {
    height: BOTTOM_BAR_HEIGHT,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  }
})

const IS_FULLSCREEN = 'IS_FULLSCREEN'

class BottomPopupMenu extends Component {
  static propTypes = {
    dismiss: PropTypes.func.isRequired,
    navigator: PropTypes.object.isRequired
  };

  state = {
    isFullScreen: false
  }
  componentDidMount() {
    AsyncStorage.getItem(IS_FULLSCREEN, (err, result) => {
      console.log('isFullScreen ' + result);
      let isFullScreen = result === '1' ? true : false
      this.setState({
        isFullScreen: isFullScreen
      })
    })
  }

  // 父组件更新是无需重新渲染
  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.isTabPageVisible !== nextProps.isTabPageVisible) {
      return true;
    }
    if (this.state.isFullScreen !== nextState.isFullScreen) {
      return true;
    }
    return false;
  }

  render() {
    return (
      <View style={style.basic}>
        <View style={style.menu_content}>
          <TouchableButton
            pressFn = {this.handleHistory}
            normalBg = {IMG.ICON_HISTORY_NORMAL}
            description = '历史'
            width = {32}
            height = {32} />

          <TouchableButton
            pressFn = {this.handleDownload}
            normalBg = {IMG.ICON_DOWNLOAD_NORMAL}
            description = '下载管理'
            width = {32}
            height = {32} />

          <TouchableButton
            pressFn = {() => this.setting()}
            normalBg = {IMG.ICON_SETTING_NORMAL}
            description = '设置'
            width = {32}
            height = {32} />

          {this.showFullScreenButton()}
        </View>
        <View style={style.menu_bottom}>
          <TouchableButton
            enabled={false}/>

          <TouchableButton
            pressFn = {() => {this.props.dismiss()}}
            normalBg = {IMG.ICON_FOLD_NORMAL} />

          <TouchableButton
            enabled={false}/>
        </View>
      </View>
    )
  }

  setting = () => {
    this.props.dismiss()
    this.props.navigator.push({
      component: SettingPage,
      scene: Transitions.LeftToRight,
    })
  }

  handleHistory = () => {
    this.props.dismiss()
    this.props.navigator.push({
      component: BookBarPage,
      scene: Transitions.LeftToRight,
    })
  }

  handleDownload = () => {
    this.props.dismiss()
    this.props.navigator.push({
      component: DownloadManagerPage,
      scene: Transitions.LeftToRight,
    })
  }

  showFullScreenButton = () => {
    let isFullScreen = this.state.isFullScreen;
    console.log('showFullScreenButton: ' + isFullScreen);
    let source = isFullScreen ? IMG.ICON_FULLSCREEN_CLOSE_NORMAL : IMG.ICON_FULLSCREEN_OPEN_NORMAL;
    let desc = isFullScreen ? '退出全屏' : '全屏'
    return !this.props.isTabPageVisible
      ? <TouchableButton
          pressFn = {this.toggleFullScreen}
          normalBg = {source}
          description = {desc}
          width = {32}
          height = {32} />
      : null
  }

  toggleFullScreen = () => {
    let isFullScreen = !this.state.isFullScreen;
    this.setState({
      isFullScreen: isFullScreen
    })
    AsyncStorage.setItem(IS_FULLSCREEN, isFullScreen ? '1' : '0');
    Emitter.emit('is_fullscreen', isFullScreen);
    this.props.dismiss()
  }
}

function mapStateToProps(state) {
  return {
  }
}

module.exports = connect(mapStateToProps, null)(BottomPopupMenu)
