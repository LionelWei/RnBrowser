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

const style = StyleSheet.create({
  basic: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent'
  }
})

export default class BottomPopupMenu extends Component {
  render() {
    return (
      <View style={style.basic}>
        <TouchableButton
          pressFn = {() => alert('收藏')}
          normalBg = 'icon_unfavor_normal'
          pressBg = 'icon_unfavor_pressed' />

        <TouchableButton
          pressFn = {() => alert('设置')}
          normalBg = 'icon_setting_normal'
          pressBg = 'icon_setting_pressed' />

        <TouchableButton
          pressFn = {()=>alert('刷新')}
          normalBg = 'icon_refresh_normal'
          pressBg = 'icon_refresh_pressed' />
      </View>
    )
  }

}
