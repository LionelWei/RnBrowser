/* @flow */

import React, { Component, PropTypes } from 'react'

import {
  Image,
  View,
  Text,
  StyleSheet,
  TextInput
} from 'react-native'

import TouchableButton from '../components/TouchableButton'
import {BOTTOM_BAR_HEIGHT} from '../utils/Consts'

const style = StyleSheet.create({
  basic: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'transparent'
  },
  menu_content: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
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

export default class BottomPopupMenu extends Component {
  static propTypes = {
    dismiss: PropTypes.func.isRequired
  };

  render() {
    return (
      <View style={style.basic}>
        <View style={style.menu_content}>
          <TouchableButton
            pressFn = {() => alert('书签/历史')}
            normalBg = 'icon_history_normal'
            pressBg = 'icon_history_pressed'
            description = '书签/历史'
            width = {32}
            height = {32} />

          <TouchableButton
            pressFn = {() => alert('下载管理')}
            normalBg = 'icon_download_normal'
            pressBg = 'icon_download_pressed'
            description = '下载管理'
            width = {32}
            height = {32} />

          <TouchableButton
            pressFn = {()=>alert('夜间模式')}
            normalBg = 'icon_night_normal'
            pressBg = 'icon_night_pressed'
            description = '夜间模式'
            width = {32}
            height = {32} />

          <TouchableButton
            pressFn = {()=>alert('检查更新')}
            normalBg = 'icon_check_update_normal'
            pressBg = 'icon_check_update_pressed'
            description = '检查更新'
            width = {32}
            height = {32} />
        </View>
        <View style={style.menu_content}>
          <TouchableButton
            pressFn = {() => alert('收藏')}
            normalBg = 'icon_unfavor_normal'
            pressBg = 'icon_unfavor_pressed'
            description = '收藏'
            width = {32}
            height = {32} />

          <TouchableButton
            pressFn = {() => alert('设置')}
            normalBg = 'icon_setting_normal'
            pressBg = 'icon_setting_pressed'
            description = '设置'
            width = {32}
            height = {32} />

          <TouchableButton
            pressFn = {()=>alert('刷新')}
            normalBg = 'icon_refresh_normal'
            pressBg = 'icon_refresh_pressed'
            description = '刷新'
            width = {32}
            height = {32} />

          <TouchableButton
            pressFn = {()=>alert('退出')}
            normalBg = 'icon_exit_normal'
            pressBg = 'icon_exit_pressed'
            description = '退出'
            width = {32}
            height = {32} />
        </View>
        <View style={style.menu_bottom}>
          <TouchableButton
            pressFn = {() => alert('关于')}
            normalBg = 'icon_about_normal'
            pressBg = 'icon_about_pressed' />

          <TouchableButton
            pressFn = {() => {this.props.dismiss()}}
            normalBg = 'icon_fold_normal'
            pressBg = 'icon_fold_pressed' />

          <TouchableButton
            pressFn = {()=>alert('分享')}
            normalBg = 'icon_share_normal'
            pressBg = 'icon_share_pressed' />
        </View>
      </View>
    )
  }

}
