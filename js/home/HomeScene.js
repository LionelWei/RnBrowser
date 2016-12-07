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


import HomeContent from './HomeContent'
import {Emitter} from '../events/Emitter'

export default class extends Component {
  static propTypes = {
    navigator: PropTypes.object
  };

  render() {
    const {navigator} = this.props
    return (
      <View style={{flex: 1}}>
        {this.renderContent()}
      </View>
    )
  }

  renderContent = () => {
    return (
      <HomeContent />
    )
  }
}
