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

  onRender: Function = () => {
    return (
      <BottomPopupItems dismiss={() => {this.setVisible(false)}}/>
    )
  }
}
