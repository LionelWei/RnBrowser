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
import * as IMG from '../assets/imageAssets'

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
            normalBg = {IMG.ICON_HISTORY_NORMAL}
            pressBg = {IMG.ICON_HISTORY_PRESSED}
            description = '书签/历史'
            width = {32}
            height = {32} />

          <TouchableButton
            pressFn = {() => alert('下载管理')}
            normalBg = {IMG.ICON_DOWNLOAD_NORMAL}
            pressBg = {IMG.ICON_DOWNLOAD_PRESSED}
            description = '下载管理'
            width = {32}
            height = {32} />

          <TouchableButton
            pressFn = {()=>alert('夜间模式')}
            normalBg = {IMG.ICON_NIGHT_NORMAL}
            pressBg = {IMG.ICON_NIGHT_PRESSED}
            description = '夜间模式'
            width = {32}
            height = {32} />

          <TouchableButton
            pressFn = {()=>alert('检查更新')}
            normalBg = {IMG.ICON_CHECK_UPDATE_NORMAL}
            pressBg = {IMG.ICON_CHECK_UPDATE_PRESSED}
            description = '检查更新'
            width = {32}
            height = {32} />
        </View>
        <View style={style.menu_content}>
          <TouchableButton
            pressFn = {() => alert('收藏')}
            normalBg = {IMG.ICON_UNFAVOR_NORMAL}
            pressBg = {IMG.ICON_UNFAVOR_PRESSED}
            description = '收藏'
            width = {32}
            height = {32} />

          <TouchableButton
            pressFn = {() => alert('设置')}
            normalBg = {IMG.ICON_SETTING_NORMAL}
            pressBg = {IMG.ICON_SETTING_PRESSED}
            description = '设置'
            width = {32}
            height = {32} />

          <TouchableButton
            pressFn = {()=>alert('刷新')}
            normalBg = {IMG.ICON_REFRESH_NORMAL}
            pressBg = {IMG.ICON_REFRESH_PRESSED}
            description = '刷新'
            width = {32}
            height = {32} />

          <TouchableButton
            pressFn = {()=>alert('退出')}
            normalBg = {IMG.ICON_EXIT_NORMAL}
            pressBg = {IMG.ICON_EXIT_PRESSED}
            description = '退出'
            width = {32}
            height = {32} />
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

}
