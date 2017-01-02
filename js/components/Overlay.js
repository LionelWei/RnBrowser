// @flow

import React, { PropTypes, Component } from 'react';
import { StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';

import {SCREEN_HEIGHT, SCREEN_WIDTH} from '../utils/Consts'

class Overlay extends Component {
  static propTypes = {
    onPress: PropTypes.func,
    backgroundColor: PropTypes.string,
    opacity: PropTypes.number,
    animationDuration: PropTypes.number,
    showOverlay: PropTypes.bool,
    pointerEvents: PropTypes.string,
  };

  static defaultProps = {
    backgroundColor: '#000',
    opacity: 0.4,
    animationDuration: 100,
    showOverlay: false,
  };

  state: {
    opacity: Object
  }

  constructor(props: any) {
    super(props);
    this.state = {
      opacity: new Animated.Value(0),
    };
  }

  // 父组件更新是无需重新渲染
  shouldComponentUpdate() {
    return false;
  }

  componentWillReceiveProps(nextProps: any) {
    if (this.props.showOverlay !== nextProps.showOverlay) {
      const toValue = nextProps.showOverlay ? nextProps.opacity : 0;
      Animated.timing(this.state.opacity, {
        toValue,
        duration: this.props.animationDuration,
      }).start();
    }
  }

  render() {
    const { onPress, pointerEvents } = this.props;
    const backgroundColor = { backgroundColor: this.props.backgroundColor };
    const opacity = { opacity: this.state.opacity };

    return (
      <Animated.View
        pointerEvents={pointerEvents}
        style={[styles.overlay, backgroundColor, opacity]}
      >
        <TouchableOpacity onPress={onPress} style={[styles.overlay]} />
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    top: -5,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
  },
});

export default Overlay;
