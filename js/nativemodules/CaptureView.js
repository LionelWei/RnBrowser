// @flow

import { PropTypes } from 'react';
import { requireNativeComponent, View } from 'react-native';

var iface = {
  name: 'CaptureView',
  propTypes: {
    tag: PropTypes.number,
    tagWithRect: PropTypes.shape({
      tag: PropTypes.number,
      x: PropTypes.number,
      y: PropTypes.number,
      w: PropTypes.number,
      h: PropTypes.number,
    }),
    ...View.propTypes // 包含默认的View的属性
  },
};

module.exports = requireNativeComponent('CaptureView', iface);
