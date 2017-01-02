/* @flow */

import React, { Component, PropTypes } from 'react'

import {
  Platform,
  StatusBar,
  BackAndroid,
  View,
  Modal,
  Navigator,
  Text,
  TouchableHighlight
} from 'react-native'

import {Emitter} from '../events/Emitter'

import TabController from '../tabs/TabController'

export default class Home extends Component {
  static propTypes = {
    navigator: PropTypes.object
  };

  render() {
    const {navigator} = this.props
    return (
      <View style={{flex: 1}}>
        <TabController
          navigator={this.props.navigator}/>
      </View>
    )
  }
}
