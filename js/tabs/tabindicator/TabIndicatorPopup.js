/* @flow */

import React, { Component, PropTypes} from 'react';
import {
  Text,
  TouchableHighlight,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Dimensions
} from 'react-native';

import Popup from '../../components/Popup'
import TabIndicatorInternal from './TabIndicatorInternal'

class TabIndicatorPopup extends Popup {
  render() {
    return (
      <View style={{
          position: 'absolute',
          height: this.state.height,
          bottom: this.state.bottom,
          left: 0,
          right: 0,
        }}>
        <TabIndicatorInternal
          dismiss={() => {this.setModalVisible(false)}}/>
      </View>
    )
  }
}

module.exports = TabIndicatorPopup
