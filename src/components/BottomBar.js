/* @flow */

import React, { Component } from 'react'

import {
  Image,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback
} from 'react-native'

import TouchableButton from './TouchableButton'

const style = StyleSheet.create({
  bottombar: {
    height: 56,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  }
})

const bg='bottombar_bg_with_shadow'

export default class extends Component {

  constructor() {
    super()
  }

  render() {
    return (
      <Image style={style.bottombar} source={{uri: bg}}>
        <TouchableButton
          pressFn = {() => alert('后退')}
          normalBg = 'icon_back_normal'
          pressBg = 'icon_back_pressed' />

        <TouchableButton
          pressFn = {() => alert('前进')}
          normalBg = 'icon_forward_normal'
          pressBg = 'icon_forward_pressed' />

        <TouchableButton
          pressFn = {() => alert('菜单')}
          normalBg = 'icon_menu_normal'
          pressBg = 'icon_menu_pressed' />

        <TouchableButton
          pressFn = {() => alert('新增')}
          normalBg = 'icon_new_add_normal'
          pressBg = 'icon_new_add_pressed' />

        <TouchableButton
          pressFn = {()=>alert('主页')}
          normalBg = 'icon_home_normal'
          pressBg = 'icon_home_pressed' />
      </Image>
    )
  }
}
