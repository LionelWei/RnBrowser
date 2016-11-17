/* @flow */

import React, { Component } from 'react'

import {
  Platform,
  StatusBar,
  BackAndroid,
  View,
  Navigator
} from 'react-native'

import Home from './home/HomeScene'

export const STATUS_BAR_HEIGHT = (Platform.OS === 'ios' ? 20 : 25)
export const NAV_BAR_HEIGHT = (Platform.OS === 'ios' ? 44 : 56)
export const ABOVE_LOLIPOP = Platform.Version && Platform.Version > 19

export default class extends Component {

  componentDidMount () {
    BackAndroid.addEventListener('hardwareBackPress', this.handleBack)
  }

  componentWillUnmount () {
    BackAndroid.removeEventListener('hardwareBackPress', this.handleBack)
  }

  // <StatusBar
  //   barStyle='light-content'
  //   backgroundColor='transparent'
  //   style={{height: STATUS_BAR_HEIGHT}}
  //   translucent={ABOVE_LOLIPOP}
  // />

  render() {
    return (
      <View style={{flex: 1}}>
        <Navigator
          ref='navigator'
          initialRoute={{
            component: Home
          }}
          configureScene={this.configureScene}
          renderScene={(route, navigator) => {
            return <route.component navigator={navigator} {...route} {...route.passProps}/>
          }}/>
      </View>
    )
  }

  configureScene (route) {
    return route.scene || Navigator.SceneConfigs.FloatFromBottom
  }

  handleBack = () => {
    const navigator = this.refs.navigator
    if (navigator && navigator.getCurrentRoutes().length > 1) {
      navigator.pop()
      return true
    }
    return false
  };
}
