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

import SlideAnimation from '../animation/SlideAnimation'
import Overlay from '../components/Overlay'

var {height: HEIGHT, width: WIDTH} = Dimensions.get('window');

var slideAnimation = new SlideAnimation({ animationDuration: 50 })

export default class extends Component {
  state = {
    visible: false,
    showOverlay: false,
  }

  open = () => {
    this.setVisible(true)
  }

  close = () => {
    this.setVisible(false)
  }

  onOverlayPress = () => {
    this.setVisible(false)
  }

  componentWillReceiveProps(nextProps: any) {
    this.setVisible(nextProps.isVisible);
  }

  isVisible = () => {
    return this.state.visible;
  }

  setVisible(visible: bool) {
    this.setState({
      visible: visible,
      showOverlay: visible
    })

    slideAnimation.toValue(visible ? 1 : 0, () => {
      // 减少渲染次数
      // this.setState({
      //   visible: visible
      // })
    })
  }

  shouldComponentUpdate(nextProps: any, nextState: any) {
    return true;
  }

  render() {
    let hidden = this.state.visible ? null : styles.hidden;
    let isShowOverlay = this.state.showOverlay;
    return (
      <View style={[styles.outer, hidden]}>
          <Overlay
            onPress = {this.onOverlayPress}
            showOverlay={isShowOverlay}/>
          <Animated.View
            style={[styles.menu_content, slideAnimation.animations]}>
            {this.onRender()}
          </Animated.View>
      </View>
    );
  }

  // 渲染子节点
  onRender() {
  }
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    position: 'absolute',
    bottom:0,
    left: 0,
    width: WIDTH,
    height: HEIGHT,
    flexDirection: 'column',
    justifyContent: 'flex-end'
  },
  hidden: {
    top: 1000,
    left: 0,
    width: 0,
    height: 0,
  },
  menu_content: {
    height: 220,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
})
