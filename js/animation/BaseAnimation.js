// @flow

import React, { Component } from 'react';
import { Animated } from 'react-native';

export default class BaseAnimation {
  constructor(toValue: ?number = 0) {
    this.animate = new Animated.Value(toValue);
    this.animations = this.createAnimations();
  }

  toValue(toValue: number) {
    return toValue;
  }

  createAnimations(): Object {
    return {};
  }
}
