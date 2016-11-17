/* @flow */

import React, { Component } from 'react'

import {
  View,
  Text,
  StyleSheet
} from 'react-native'

import {STATUS_BAR_HEIGHT, NAV_BAR_HEIGHT} from '../App'

const style = StyleSheet.create({
  titlebar: {
    height: 60
  }
})

export default class extends Component {
  render() {
    return (
      <View style={style.titlebar}>
        <Text>TitleBar</Text>
      </View>
    )
  }
}
