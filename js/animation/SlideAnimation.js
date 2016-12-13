/* @flow */

import { Animated } from 'react-native';
import BaseAnimation from './BaseAnimation';

type Param = {
  toValue: number,
  slide: string,
}

export default class SlideAnimation extends BaseAnimation {
  constructor({ toValue = 0, slideFrom = 'bottom' }: Param) {
    super(toValue);
    this.animations = this.createAnimations(slideFrom);
  }

  toValue(toValue: number, onFinished: Function) {
    Animated.spring(this.animate, {
      toValue,
      velocity: 0,
      tension: 70,
      friction: 10,
    }).start(onFinished || null);
  }

  createAnimations(slideFrom: string): Object {
    const transform = [];

    if (['top', 'bottom'].includes(slideFrom)) {
      if (slideFrom === 'bottom') {
        transform.push({
          translateY: this.animate.interpolate({
            inputRange: [0, 1],
            outputRange: [220, 1],
          }),
        });
      } else {
        transform.push({
          translateY: this.animate.interpolate({
            inputRange: [0, 1],
            outputRange: [-800, 1],
          }),
        });
      }
    } else if (['left', 'right'].includes(slideFrom)) {
      if (slideFrom === 'right') {
        transform.push({
          translateX: this.animate.interpolate({
            inputRange: [0, 1],
            outputRange: [800, 1],
          }),
        });
      } else {
        transform.push({
          translateX: this.animate.interpolate({
            inputRange: [0, 1],
            outputRange: [-800, 1],
          }),
        });
      }
    }

    const animations = {
      transform,
    };

    return animations;
  }
}
