/* @flow */

import React, { Component, PropTypes } from 'react'

import {
  Image,
  View,
  Text,
  StyleSheet,
  TextInput,
  Platform,
} from 'react-native'
import DownloadManagerScreen from '../download/DownloadManagerScreen'
import TabManageScreen from '../tabs/manage/TabManageScreen'
import BookBarScreen from '../bookbar/BookBarScreen'
import SettingScreen from '../setting/SettingScreen'

import {connect} from 'react-redux'
import TouchableButton from '../components/TouchableButton'
import {BOTTOM_BAR_HEIGHT} from '../utils/Consts'
import {Emitter} from '../events/Emitter'
import * as IMG from '../assets/imageAssets'
import Transitions from '../animation/NavigatorAnimation'
import {foo, bar} from '../nativemodules/UrlDownload'


var isExitButtonVisible = Platform.OS !== 'ios'

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

class BottomPopupMenu extends Component {
  static propTypes = {
    dismiss: PropTypes.func.isRequired,
    navigator: PropTypes.object.isRequired
  };

  // 父组件更新是无需重新渲染
  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.isTabPageVisible !== nextProps.isTabPageVisible) {
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
            pressBg = {IMG.ICON_HISTORY_PRESSED}
            description = '历史'
            width = {32}
            height = {32} />

          <TouchableButton
            pressFn = {this.handleDownload}
            normalBg = {IMG.ICON_DOWNLOAD_NORMAL}
            pressBg = {IMG.ICON_DOWNLOAD_PRESSED}
            description = '下载管理'
            width = {32}
            height = {32} />

          <TouchableButton
            pressFn = {() => this.setting()}
            normalBg = {IMG.ICON_SETTING_NORMAL}
            pressBg = {IMG.ICON_SETTING_PRESSED}
            description = '设置'
            width = {32}
            height = {32} />

          {this.showRefreshButton()}
        </View>
        <View style={style.menu_bottom}>
          <TouchableButton
            pressFn = {() => alert('关于')}
            normalBg = {IMG.ICON_ABOUT_NORMAL}
            pressBg = {IMG.ICON_ABOUT_PRESSED} />

          <TouchableButton
            pressFn = {() => {this.props.dismiss()}}
            normalBg = {IMG.ICON_FOLD_NORMAL}
            pressBg = {IMG.ICON_FOLD_PRESSED} />

          <TouchableButton
            pressFn = {()=>alert('分享')}
            normalBg = {IMG.ICON_SHARE_NORMAL}
            pressBg = {IMG.ICON_SHARE_PRESSED} />
        </View>
      </View>
    )
  }

  setting = () => {
    this.props.dismiss()
    this.props.navigator.push({
      component: SettingScreen,
      scene: Transitions.LeftToRight,
    })
  }

  handleHistory = () => {
    this.props.dismiss()
    this.props.navigator.push({
      component: BookBarScreen,
      scene: Transitions.LeftToRight,
    })
  }

  handleDownload = () => {
    this.props.dismiss()
    this.props.navigator.push({
      component: DownloadManagerScreen,
      scene: Transitions.LeftToRight,
    })
  }

  showRefreshButton = () => {
    return !this.props.isTabPageVisible
      ? <TouchableButton
          pressFn = {this.reload}
          normalBg = {IMG.ICON_REFRESH_NORMAL}
          pressBg = {IMG.ICON_REFRESH_PRESSED}
          description = '刷新'
          width = {32}
          height = {32} />
      : null
  }

  showExitButton = () => {
    return isExitButtonVisible
      ? <TouchableButton
        pressFn = {()=>alert('退出')}
        normalBg = {IMG.ICON_EXIT_NORMAL}
        pressBg = {IMG.ICON_EXIT_PRESSED}
        description = '退出'
        width = {32}
        height = {32} />
      : <TouchableButton
        width = {32}
        height = {32} />
  }

  reload = () => {
    Emitter.emit('web_reload', true);
    this.props.dismiss();
  }

}

function mapStateToProps(state) {
  return {
    tabId: state.tabinfo.tabId,
  }
}

module.exports = connect(mapStateToProps, null)(BottomPopupMenu)
