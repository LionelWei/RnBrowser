/* @flow */

import React, { Component, PropTypes} from 'react';
import {
  Dimensions
} from 'react-native';

var {height, width} = Dimensions.get('window');

export default class Popup extends Component {
  static propTypes = {
    isVisible: PropTypes.bool,
  }

  state = {
    bottom: -height,
    height: 0,
    modalVisible: false,
  }

  componentWillReceiveProps(nextProps: any) {
    this.setModalVisible(nextProps.isVisible);
  }

  setModalVisible(visible: bool) {
    this.setState({
      bottom: visible ? 0 : -height,
      height: visible ? height: 0,
      modalVisible: visible
    });
  }
}
