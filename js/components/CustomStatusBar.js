// @flow

import React, { Component } from 'react'
import {
  Platform,
  StatusBar,
  BackAndroid,
  View,
  Navigator,
  Text,
  ToastAndroid
} from 'react-native'

import {STATUS_BAR_HEIGHT} from '../utils/Consts'

const isIOS = Platform.OS === 'ios'
export default class CustomStatusBar extends Component {
  render() {
    return isIOS ? this.renderAndroidStatusBar() : this.renderAndroidStatusBar();
  }

  renderAndroidStatusBar = () => {
    return (
      <StatusBar
        barStyle='default'
        hidden={false}
        backgroundColor='silver'
      />
    )
  }

  renderIosStatusBar = () => {
    return (
      <View style={{height: STATUS_BAR_HEIGHT}}>
        <StatusBar
          barStyle='default'
          hidden={false}
        />
      </View>
    )
  }
}
