/* @flow */

import {
  Dimensions,
  Navigator
} from 'react-native';

import {SCREEN_WIDTH} from '../utils/Consts'
var BaseConfigLeftToRight = Navigator.SceneConfigs.FloatFromRight;
var BaseConfigBottomToTop = Navigator.SceneConfigs.FloatFromBottom;

var CustomLeftToRightGesture = Object.assign({}, BaseConfigLeftToRight.gestures.pop, {
  // 用户中断返回手势时，迅速弹回
  snapVelocity: 8,

  // 如下设置可以使我们在屏幕的任何地方拖动它
  edgeHitWidth: SCREEN_WIDTH,
});

var CustomSceneConfig = (base) => {
  return (
    Object.assign({}, base, {
      // 如下设置使过场动画看起来很快
      springTension: 100,
      springFriction: 1,

      // // 使用上面我们自定义的手势
      // gestures: {
      //   pop: CustomLeftToRightGesture,
      // }
    })
  )
};



module.exports = {
  LeftToRight: CustomSceneConfig(BaseConfigLeftToRight),
  BottomToTop: CustomSceneConfig(BaseConfigBottomToTop)
}
