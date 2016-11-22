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
    backgroundColor: 'transparent'
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
            pressFn = {() => alert('收藏')}
            normalBg = 'icon_unfavor_normal'
            pressBg = 'icon_unfavor_pressed'
            description = '收藏'
            width = {40}
            height = {40} />

          <TouchableButton
            pressFn = {() => alert('设置')}
            normalBg = 'icon_setting_normal'
            pressBg = 'icon_setting_pressed'
            description = '设置'
            width = {40}
            height = {40} />

          <TouchableButton
            pressFn = {()=>alert('刷新')}
            normalBg = 'icon_refresh_normal'
            pressBg = 'icon_refresh_pressed'
            description = '刷新'
            width = {40}
            height = {40} />
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
