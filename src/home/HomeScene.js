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
import TitleBar from '../components/TitleBarWithUrlInput'
import HomeContent from './HomeContent'

export default class extends Component {
  constructor() {
    super()
    this.state = {
      currentUrl: 'http://www.play.cn/'
    }
  }

  search(url: string) {
    this.setState({
      currentUrl: url
    })
  }

  render() {
    console.log('currentUrl: ' + this.state.currentUrl);

    return (
      <View style={{flex: 1}}>
        <TitleBar search={(url) => this.search(url)}/>
        <HomeContent url={this.state.currentUrl}/>
        <BottomBar />
      </View>
    )
  }
}
