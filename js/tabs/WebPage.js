/*
 * @flow */

import React, {PropTypes, Component } from 'react';
import {
  WebView,
  View,
  Text,
  Dimensions,
  StyleSheet
} from 'react-native';
import {NAV_BAR_HEIGHT ,BOTTOM_BAR_HEIGHT} from '../utils/Consts'

import {connect} from 'react-redux'
import {Emitter} from '../events/Emitter'
import Web from './Web'

import WebTitleBar from './WebTitleBar'
import BottomBar from '../components/BottomBar'

class WebPage extends Component {
  render() {
    return (
      <View style={{
        flex: 1
      }}>
        <WebTitleBar id={this.props.id} navigator={this.props.navigator}/>
        <Web id={this.props.id} url={this.props.url}/>
        <BottomBar />
      </View>
    )
  }
}

module.exports = WebPage
