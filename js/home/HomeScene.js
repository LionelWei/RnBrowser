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


import BottomBar from '../components/BottomBar'
import TitleBar from './HomeTitleBar'
import HomeContent from './HomeContent'
import {Emitter} from '../events/Emitter'

export default class extends Component {
  static propTypes = {
    navigator: PropTypes.object
  };

  state = {
    currentUrl: 'https://www.baidu.com'
  }

  constructor() {
    super()
    Emitter.addListener('url_changed', (...args) => {
      var url: string = args[0];
      this.setState({
        currentUrl: url
      })
    });
  }

  render() {
    const {navigator} = this.props
    console.log('currentUrl: ' + this.state.currentUrl);

    return (
      <View style={{flex: 1}}>
        <TitleBar {...this.props}/>
        <HomeContent url={this.state.currentUrl}/>
        <BottomBar navigator={this.props.navigator}/>
      </View>
    )
  }
}
