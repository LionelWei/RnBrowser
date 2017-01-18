// @flow

import { Animated, Easing} from 'react-native';
import BaseAnimation from './BaseAnimation';

export default class TabScaleAnimation extends BaseAnimation {
  toValue(toValue: number, onFinished) {
    Animated.timing(this.animate, {
      toValue: toValue === 0 ? 0.8 : 1,
      duration: 400,
      easing: Easing.Linear
    }).start(onFinished || null);
    // switch (toValue) {
    //   case 0:
    //     Animated.spring(this.animate, {
    //       toValue,
    //       velocity: 3,
    //       tension: 250,
    //       friction: 20,
    //     }).start();
    //     break;
    //   case 1:
    //     Animated.spring(this.animate, {
    //       toValue,
    //       velocity: 0,
    //       tension: 65,
    //       friction: 7,
    //     }).start();
    //     break;
    //   default:
    //     break;
    // }
  }

  createAnimations() {
    const transform = [
      {
        scale: this.animate
      }
    ];

    const animations = {
      transform,
    };

    return animations;
  }
}
