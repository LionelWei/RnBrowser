// @flow

import React, {PropTypes, Component } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  Navigator,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback
} from 'react-native';
import TabScaleAnimation from '../animation/TabScaleAnimation'

export default class ZoomablePage extends Component {
  scaleAnimation = new TabScaleAnimation(1)

  state = {
    zoomOut: false,
    zoomDone: true,
  }

  componentDidMount() {
    this.scaleAnimation.toValue(1);
  }

  render() {
    return (
      <Animated.View
        style={[styles.container, this.scaleAnimation.animations]}>
        <TouchableWithoutFeedback onPress={this.handleZoomOut}>
          {this.onRender()}
        </TouchableWithoutFeedback>
      </Animated.View>
    )
  }

  onZoomOut(isZoomOut: bool) {
    this.setState({
      zoomOut: isZoomOut,
      zoomDone: false
    })
    this.scaleAnimation.toValue(isZoomOut ? 0 : 1, () => {
      this.setState({
        zoomDone: true
      })
    })
  }

  handleZoomOut = () => {
    if (this.state.zoomOut) {
      this.onZoomOut(false);
    }
  }


  onRender = () => {
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
})
