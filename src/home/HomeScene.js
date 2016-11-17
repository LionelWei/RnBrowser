/* @flow */

import React, { Component } from 'react'

import {
  Platform,
  StatusBar,
  BackAndroid,
  View,
  Navigator
} from 'react-native'


import BottomBar from '../components/BottomBar'
import TitleBar from '../components/TitleBarWithSearch'
import HomeContent from './HomeContent'

export default class extends Component {
  render() {
    return (
      <View style={{flex: 1}}>
        <TitleBar />
        <HomeContent />
        <BottomBar />
      </View>
    )
  }
}
