// @flow

import React, {PropTypes, Component } from 'react';
import {
  WebView,
  View,
  Text,
  StyleSheet,
  PanResponder,
  ToastAndroid
} from 'react-native';
import {Bar} from 'react-native-progress';

const DEFAULT_HEIGHT = 2;
const DEFAULT_COLOR = 'rgba(0, 122, 255, 1)'
const TITLEBAR_COLOR = 'transparent'

export default class ProgressBar extends Component {
  static propTypes = {
    hideAfterFinish: PropTypes.bool
  }

  state = {
    progress: 0,
    color: TITLEBAR_COLOR,
  }

  isHidden = false;
  isFraction = false; // 区分传过来的值是0~100还是0~1
  timer = {}

  updateProgress = (progress: number) => {
    if (progress < 0) {
      return;
    }
    if (progress !== 0 && progress < 1 && !this.isFraction) {
      this.isFraction = true;
    }

    let fraction = this.isFraction ? progress: progress / 100;
    if (fraction >= 1) {
      if (this.props.hideAfterFinish && !this.isHidden) {
        this.isHidden = true
        this.setState({
          progress: 1,
        })
        this.timer = setTimeout(() => this.setState({
          progress: 0,
          color: TITLEBAR_COLOR
        }), 400)
      }
      return;
    } else {
      this.isHidden = false;
      this.setState({
        progress: fraction,
        color: DEFAULT_COLOR,
      })
    }
  }

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
  }

  render() {
    if (this.state.color === TITLEBAR_COLOR) {
      return null;
    }
    return (
      <Bar
        {...this.props}
        progress={this.state.progress}
        color={this.state.color}
      />
    )
  }
}
