/* @flow */

import React, { Component, PropTypes} from 'react';
import {
  Modal,
  Text,
  TouchableHighlight,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions
} from 'react-native';

import Popup from '../components/Popup'
import BottomPopupItems from './BottomPopupItems'

export default class extends Popup {

  render() {
    console.log('height: ' + this.state.height);
    return (
      <View style={{
        position: 'absolute',
        height: this.state.height,
        bottom: this.state.bottom,
        left: 0,
        right: 0,
      }}>
        <TouchableWithoutFeedback
          onPress={() => {this.setModalVisible(false)}}>
          <View style={{
              flex: 1
            }}>
            <View style={{
              flex: 1,
              backgroundColor: 'black',
              opacity: 0.2
            }}/>
            <View style={styles.container}>
              <View style={styles.menu_content}>
                <BottomPopupItems dismiss={() => {this.setModalVisible(false)}}/>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  menu_content: {
    height: 220,
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
})
