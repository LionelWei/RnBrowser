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

  tabController = {}

  render() {
    const {navigator} = this.props
    return (
      <View style={{flex: 1}}>
        <TabController
          ref={(tab) => this.tabController = tab}
          navigator={this.props.navigator}/>
      </View>
    )
  }

  static handleBack() {
    console.log('home handleBack()');
    this.tabController.handleBack();
    return true
  }

  handleBack0() {

  }
}
