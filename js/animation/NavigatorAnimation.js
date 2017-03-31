/* @flow */

import {
  Dimensions,
  Navigator,
  PIXEL_RATIO
} from 'react-native';

import {SCREEN_WIDTH} from '../utils/Consts'
const buildStyleInterpolator = require('buildStyleInterpolator');

var BaseConfigLeftToRight = Navigator.SceneConfigs.FloatFromRight;
var BaseConfigBottomToTop = Navigator.SceneConfigs.FloatFromBottom;


var FadeToTheLeft = {
  // Rotate *requires* you to break out each individual component of
  // rotation (x, y, z, w)
  transformTranslate: {
    from: {x: 0, y: 0, z: 0},
    to: {x: 0, y: 0, z: 0},
    min: 0,
    max: 1,
    type: 'linear',
    extrapolate: true,
    round: PIXEL_RATIO,
  },
  transformScale: {
    from: {x: 1, y: 1, z: 1},
    to: {x: 1, y: 1, z: 1},
    min: 0,
    max: 1,
    type: 'linear',
    extrapolate: true
  },
  opacity: {
    from: 1,
    to: 1,
    min: 0,
    max: 1,
    type: 'linear',
    extrapolate: false,
    round: 100,
  },
  translateX: {
    from: 0,
    to: -Math.round(SCREEN_WIDTH * 0.3),
    min: 0,
    max: 1,
    type: 'linear',
    extrapolate: true,
    round: PIXEL_RATIO,
  },
  scaleX: {
    from: 1,
    to: 1,
    min: 0,
    max: 1,
    type: 'linear',
    extrapolate: true
  },
  scaleY: {
    from: 1,
    to: 1,
    min: 0,
    max: 1,
    type: 'linear',
    extrapolate: true
  },
};

var FadeToTheRight = {
  ...FadeToTheLeft,
  transformTranslate: {
    from: {x: 0, y: 0, z: 0},
    to: {x: Math.round(SCREEN_WIDTH * 0.3), y: 0, z: 0},
  },
  translateX: {
    from: 0,
    to: Math.round(SCREEN_WIDTH * 0.3),
  },
};

var CustomLeftToRightGesture = Object.assign({}, BaseConfigLeftToRight.gestures.pop, {
  // 用户中断返回手势时，迅速弹回
  snapVelocity: 8,

  // 如下设置可以使我们在屏幕的任何地方拖动它
  // edgeHitWidth: SCREEN_WIDTH,
  edgeHitWidth: 50,
});

var CustomLeftToRight = {
  ...Navigator.SceneConfigs.FloatFromRight,
  gestures: {
    pop: CustomLeftToRightGesture
  },
}

var CustomSceneConfig = (base) => {
  return (
    Object.assign({}, base, {
      // 如下设置使过场动画看起来很快
      springTension: 100,
      springFriction: 1,
    })
  )
};

var NoTransition = {
    opacity: {
        from: 1,
        to: 1,
        min: 1,
        max: 1,
        type: 'linear',
        extrapolate: false,
        round: 100
    }
};

var PageSwipeFromRight = {
  ...Navigator.SceneConfigs.FloatFromRight,
}

let scene = Navigator.SceneConfigs.FloatFromRight
let popGesture = CustomLeftToRightGesture;
let backGesture = popGesture;
let forwardGesture = {
  ...popGesture,
  direction: 'right-to-left',
}

var WebPageSwipe = {
  ...Navigator.SceneConfigs.FloatFromRight,
  gestures: {
    jumpBack: backGesture,
    pop: null,
    jumpForward: forwardGesture
  },
  defaultTransitionVelocity: 5000,
  animationInterpolators: {
    ...Navigator.SceneConfigs.FloatFromRight.animationInterpolators,
    out: buildStyleInterpolator(FadeToTheRight)
  }
}

const Transitions = {
    NONE: {
        ...Navigator.SceneConfigs.FadeAndroid,
        gestures: null,
        defaultTransitionVelocity: 1000,
        animationInterpolators: {
            into: buildStyleInterpolator(NoTransition),
            out: buildStyleInterpolator(NoTransition)
        }
    },
    LeftToRight: CustomSceneConfig(CustomLeftToRight),
    BottomToTop: CustomSceneConfig(BaseConfigBottomToTop),
    PageSwipeFromRight: PageSwipeFromRight,
    WebPageSwipe: CustomSceneConfig(WebPageSwipe),
};

module.exports = Transitions;
