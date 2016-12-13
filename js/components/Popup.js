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

var slideAnimation = new SlideAnimation({ animationDuration: 150 })

export default class extends Component {
  state = {
    visible: false,
    showOverlay: false,
  }

  open = () => {
    console.log('==== open ====');
    this.setVisible(true)
  }

  onOverlayPress= () => {
    this.setVisible(false)
  }

  componentWillReceiveProps(nextProps: any) {
    this.setVisible(nextProps.isVisible);
  }

  setVisible(visible: bool) {
    this.setState({
      visible: true,
      showOverlay: visible
    })

    slideAnimation.toValue(visible ? 1 : 0, () => {
      this.setState({
        visible: visible
      })
    })
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
    bottom: 10000,
    left: 0,
  },
  menu_content: {
    height: 220,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
})
