/* @flow */

import React, { Component, PropTypes} from 'react'

import {
  Image,
  View,
  Text,
  StyleSheet,
  Navigator,
  TouchableWithoutFeedback,
  Modal,
  TouchableHighlight
} from 'react-native'

import EventEmitter from 'EventEmitter'

import TouchableButton from './TouchableButton'
import BottomMenuModal from '../bottompopup/BottomMenuModal'
import {BOTTOM_BAR_HEIGHT} from '../utils/Consts'
import {Emitter} from '../events/Emitter'

const style = StyleSheet.create({
  bottombar: {
    height: BOTTOM_BAR_HEIGHT,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  }
})


const bg='bottombar_bg_with_shadow'

export default class extends Component {
  static propTypes = {
    navigator: PropTypes.object
  };

  constructor() {
    super()
  }

  render() {
    const {navigator} = this.props
    return (
      <View>
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
            pressFn={() => {
              Emitter.emit('show_bottom_menu', true);
            }}
            normalBg = 'icon_menu_normal'
            pressBg = 'icon_menu_pressed' />

          <TouchableButton
            pressFn = {() => alert('新增')}
            normalBg = 'icon_new_add_normal'
            pressBg = 'icon_new_add_pressed' />

          <TouchableButton
            pressFn = {() => alert('主页')}
            normalBg = 'icon_home_normal'
            pressBg = 'icon_home_pressed' />
        </Image>
        <BottomMenuModal />
      </View>
    )
  }
}
