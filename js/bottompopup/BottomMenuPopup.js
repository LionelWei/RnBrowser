/* @flow */

import React, { Component, PropTypes} from 'react';
import {
  Text,
  TouchableHighlight,
  View,
  StyleSheet,
  Dimensions,
  Animated,
  Easing
} from 'react-native';

import BottomPopupItems from './BottomPopupItems'
import Popup from '../components/Popup'

export default class extends Popup {
  isTabPageVisible = true

  open(isTabPageVisible: bool) {
    if (isTabPageVisible !== this.isTabPageVisible) {
      this.isTabPageVisible = isTabPageVisible
      this.forceUpdate();
    }
    this.show();
  }

  onRender: Function = () => {
    return (
      <BottomPopupItems
        dismiss={() => {this.setVisible(false)}}
        isTabPageVisible={this.isTabPageVisible}
        navigator={this.props.navigator}
        reloadFn={this.props.reloadFn}
        />
    )
  }
}
