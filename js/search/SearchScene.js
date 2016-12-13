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

import TitleBar from './SearchTitleBar'
import HistoryList from './SearchHistoryList'
import {Emitter} from '../events/Emitter'

export default class extends Component {
  render() {
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <TitleBar
          tabId={this.props.tabId}
          defaultUrl={this.props.defaultUrl}
          navigator={this.props.navigator}/>
        <HistoryList
          navigator={this.props.navigator}/>
      </View>
    )
  }
}
