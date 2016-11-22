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
import TitleBar from '../components/TitleBarWithUrlInput'
import HomeContent from './HomeContent'

export default class extends Component {
  static propTypes = {
    navigator: PropTypes.object
  };

  state = {
    currentUrl: 'http://www.play.cn/',
    modalVisible: false,
  }

  constructor() {
    super()
  }

  setModalVisible(visible: bool) {
    this.setState({modalVisible: visible});
  }

  search(url: string) {
    this.setState({
      currentUrl: url
    })
    this.setModalVisible(true)
  }

  render() {
    const {navigator} = this.props
    console.log('currentUrl: ' + this.state.currentUrl);

    return (
      <View style={{flex: 1}}>
        <TitleBar search={(url) => this.search(url)}/>
        <HomeContent url={this.state.currentUrl}/>
        <BottomBar navigator={this.props.navigator}/>
      </View>
    )
  }
}
