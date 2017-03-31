/* @flow */

import React, { Component, PropTypes } from 'react'

import {
  Platform,
  BackAndroid,
  View,
  Modal,
  Navigator,
  Text,
  TouchableHighlight,
  AsyncStorage,
  Alert,
} from 'react-native'

import {Emitter} from '../events/Emitter'

import TabController from '../tabs/TabController'
import WelcomePage from './WelcomePage'
import Transitions from '../animation/NavigatorAnimation'
import * as TrafficStats from '../nativemodules/TrafficStats';

const IS_FIRST_LAUNCH = "IS_FIRST_LAUNCH_v24";

export default class Home extends Component {
  static propTypes = {
    navigator: PropTypes.object
  };

  state = {
    isInited: false,
    isFirstLaunch: false
  }

  componentWillMount() {
    console.log('HOME componentWillMount');
    AsyncStorage.getItem(IS_FIRST_LAUNCH, (err, result) => {
      console.log('result: ');
      if (result === null || result === undefined) {
        result = '1';
      }
      console.log('result: ' + result);
      this.setState({
        isInited: true,
        isFirstLaunch: (result === '1') ? true : false
      })
    })
  }

  render() {
    const {navigator} = this.props
    return (
      <View style={{flex: 1}}>
        {this.renderFirstPage()}
      </View>
    )
  }

  renderFirstPage = () => {
    if (!this.state.isInited) {
      return null;
    }
    console.log('isFirstLaunch: ' + this.state.isFirstLaunch);
    return (
      this.state.isFirstLaunch
      ? <WelcomePage
          onPressEnter={this.enterFromWelcome}/>
      : <TabController
          navigator={this.props.navigator}/>
    )
  }

  enterFromWelcome = () => {
    AsyncStorage.setItem(IS_FIRST_LAUNCH, '0');

    let maxFreeMB = this.getRandomFreeMB();
    let maxFreeBytes = maxFreeMB * 1024 * 1024;
    TrafficStats.setFreeThreshold(maxFreeBytes);
    AsyncStorage.setItem('FREE_THRESHOLD', maxFreeBytes + '');
    Alert.alert(
      '恭喜你',
      '获得了 ' + maxFreeMB + ' MB 免费流量',
      [
        {
          text: "确定",
          onPress: () => {
            this.openRealHomePage();
          }
        }
      ]
    );
  }

  getRandomFreeMB = () => {
    return parseInt((Math.random() * 3 + 1) * 500);
  }

  openRealHomePage = () => {
    this.props.navigator.replace({
      component: Home,
      scene: Transitions.LeftToRight,
    })
  }
}
