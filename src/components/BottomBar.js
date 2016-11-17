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
    flexDirection: 'row',
    height: 56,
    alignItems: 'center'
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
        <Text>BottomBar</Text>
        <TouchableButton
          pressFn = {()=>alert('haha')}
          normalBg = 'ico_setting_titlebar_normal'
          pressBg = 'ico_setting_titlebar_pressed' />
      </Image>
    )
  }
}
