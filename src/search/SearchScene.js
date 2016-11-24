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
  constructor() {
    super()
    Emitter.addListener('url_changed', (...args) => {
      this.props.navigator.pop();
    });
    Emitter.addListener('search_cancel', (...args) => {
      this.props.navigator.pop();
    })
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <TitleBar />
        <HistoryList />
      </View>
    )
  }
}
