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
  onRender: Function = () => {
    return (
      <TabIndicatorInternal
        dismiss={() => {this.setVisible(false)}}/>      
    )
  }
}

module.exports = TabIndicatorPopup
