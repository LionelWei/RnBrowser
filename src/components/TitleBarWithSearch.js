/* @flow */

import React, { Component } from 'react'

import {
  Image,
  View,
  Text,
  StyleSheet
} from 'react-native'

import TouchableButton from './TouchableButton'

const style = StyleSheet.create({
  titlebar: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: '#fff',
    alignItems: 'center'
  }
})

export default class extends Component {
  render() {
    return (
      <View style={style.titlebar}>
        <View style={{paddingLeft: 12}}>
          <Image style={{
              paddingLeft: 12,
              width: 28,
              height: 28
            }}
            source={{uri: 'icon_uc_logo'}}/>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: 'transparent'}}/>
        <View style={{paddingRight: 12}}>
          <TouchableButton
            pressFn = {()=>alert('search')}
            normalBg = 'icon_search_normal'
            pressBg = 'icon_search_pressed' />
        </View>
      </View>
    )
  }
}
