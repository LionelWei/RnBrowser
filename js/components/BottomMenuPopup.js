/* @flow */

import React, { Component, PropTypes} from 'react';
import {
  Text,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
  StyleSheet,
  Animated,
  PanResponder,
  AsyncStorage,
} from 'react-native';

import {
  isIOS,
  TOP_OFFSET,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  BOTTOM_BAR_HEIGHT
} from '../utils/Consts'

import {Emitter} from '../events/Emitter'
import {connect} from 'react-redux'
import TouchableButton from '../components/TouchableButton'
import * as IMG from '../assets/imageAssets'
import Transitions from '../animation/NavigatorAnimation'

const ICON_WIDTH = 24;
const ICON_HEIGHT = 24;

const MENU_ROW_HEIGHT = 84;

const MENU_TOP_HALF_LOW_POSITION = MENU_ROW_HEIGHT - 8;
const MENU_TOP_HALF_UPPER_POSITION = 10;

const FIRST_LAUNCH_AFTER_INSTALL = "FIRST_LAUNCH_AFTER_INSTALL";

export default class extends Component {

  state = {
    forwardEnabled: false,
    animatedValue: new Animated.Value(0),
    menuTopAnimatedValue: new Animated.Value(0),
  }

  visible = false;
  isTabPageVisible = true;

  container = {};
  topHalf = {};
  bottomHalf = {};
  topHalfTopOffset = MENU_TOP_HALF_LOW_POSITION;
  initOffset = 0;
  fowardSubscription = null;
  showCascadeAnimate = false;

  show = () => {
    this.setVisible(true)
  }

  close = () => {
    this.setVisible(false)
  }

  open(isTabPageVisible: bool) {
    this.isTabPageVisible = isTabPageVisible;
    this.show();
  }

  componentWillReceiveProps(nextProps: any) {
    this.setVisible(nextProps.isVisible);
  }

  componentWillMount() {
    this.fowardSubscription = Emitter.addListener('enableForward', (enabled) => {
      this.setState({
        forwardEnabled: enabled
      });
    });
    this.checkFirstLaunch();
  }

  componentWillUnmount() {
    this.fowardSubscription && this.fowardSubscription.remove();
  }

  checkFirstLaunch = () => {
    (async () => {
      try{
         let value = await AsyncStorage.getItem(FIRST_LAUNCH_AFTER_INSTALL);
         if (value === undefined || value === null) {
           value = true;
           (async () => {
             await AsyncStorage.setItem(FIRST_LAUNCH_AFTER_INSTALL, 'false');
           })();
         } else {
           value = false;
         }
         this.showCascadeAnimate = value;
      } catch(error){
        console.log('AsyncStorage error: ' + error);
      }
    })();
  }

  render() {
    return (
      <TouchableWithoutFeedback
        onPress={() => this.setVisible(false)}>
        <Animated.View
          ref={(view) => this.container = view}
          style={[styles.outer, {
            top: this.isVisible() ? 0 : 1000
          }]}>
          <Animated.View
            style={[styles.overlay, {
              opacity: this.state.animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.4]
              })
            }]}/>
          <Animated.View
            style={[styles.menu_content, {
              transform: [{
                translateY: this.state.animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [200, -10]
                })
              }]
            }]}>
            <Animated.View
              ref={(view) => {this.topHalf = view}}
              style={[style.top, {
                transform: [{
                  translateY: this.state.menuTopAnimatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [MENU_TOP_HALF_UPPER_POSITION, MENU_TOP_HALF_LOW_POSITION]
                  })
                }],
                borderBottomLeftRadius: this.state.menuTopAnimatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 4],
                }),
                borderBottomRightRadius: this.state.menuTopAnimatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 4],
                })
              }]}
              {...this.topHalfPanResponder.panHandlers}>
              <View style={style.menu_content}>
                <TouchableButton
                  enabled = {this.state.forwardEnabled}
                  pressFn = {this.goForward}
                  normalBg = {IMG.ICON_FORWARD_NORMAL}
                  description = '前进'
                  width = {ICON_WIDTH}
                  height = {ICON_HEIGHT} />

                <TouchableButton
                  pressFn = {this.goHome}
                  normalBg = {IMG.ICON_HOME_NORMAL}
                  description = '主页'
                  width = {ICON_WIDTH}
                  height = {ICON_HEIGHT} />

                <TouchableButton
                  pressFn = {this.refresh}
                  normalBg = {IMG.ICON_REFRESH_NORMAL}
                  description = '刷新'
                  width = {ICON_WIDTH}
                  height = {ICON_HEIGHT} />
              </View>
            </Animated.View>

            <Animated.View
              ref={(view) => {this.bottomHalf = view}}
              style={[style.bottom, {
                transform: [{
                  scale: this.state.menuTopAnimatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1.0, 0.98]
                  })
                }],
                backgroundColor: this.state.menuTopAnimatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['#fff', '#ccc'],
                })
              }]}>
              <View style={[style.menu_content]}>
                <TouchableButton
                  pressFn = {this.handleHistory}
                  normalBg = {IMG.ICON_HISTORY_NORMAL}
                  description = '历史'
                  width = {ICON_WIDTH}
                  height = {ICON_HEIGHT} />

                <TouchableButton
                  pressFn = {this.handleDownload}
                  normalBg = {IMG.ICON_DOWNLOAD_NORMAL}
                  description = '下载管理'
                  width = {ICON_WIDTH}
                  height = {ICON_HEIGHT} />

                <TouchableButton
                  pressFn = {this.setting}
                  normalBg = {IMG.ICON_SETTING_NORMAL}
                  description = '设置'
                  width = {ICON_WIDTH}
                  height = {ICON_HEIGHT} />
              </View>
            </Animated.View>
          </Animated.View>
        </Animated.View >
      </TouchableWithoutFeedback>
    );
  }

  topHalfPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => true,
    onPanResponderGrant: (evt, gestureState) => {
      this.initOffset = this.topHalfTopOffset;
    },
    onPanResponderMove: (evt, gestureState) => {
      let dy = gestureState.dy;
      let topOffset = 0;
      if (this.initOffset === MENU_TOP_HALF_UPPER_POSITION) {
        topOffset = Math.min(Math.max(dy, 0), MENU_TOP_HALF_LOW_POSITION);
      }
      else if (this.initOffset == MENU_TOP_HALF_LOW_POSITION) {
        let constraintY = Math.min(Math.max(dy, -MENU_TOP_HALF_LOW_POSITION), MENU_TOP_HALF_UPPER_POSITION);
        topOffset = MENU_TOP_HALF_LOW_POSITION + constraintY;
      }

      this.animate(this.state.menuTopAnimatedValue, topOffset / MENU_TOP_HALF_LOW_POSITION);
      this.topHalfTopOffset = topOffset;
    },
    onPanResponderTerminationRequest: (evt, gestureState) => true,
    onPanResponderRelease: (evt, gestureState) => {
      this.updateTopHalfPosition(gestureState);
    },
    onPanResponderTerminate: (evt, gestureState) => {
      this.updateTopHalfPosition(gestureState);
    },
    onShouldBlockNativeResponder: (evt, gestureState) => true,
  })

  updateTopHalfPosition = (gestureState: Object) => {
    let toLow = this.topHalfTopOffset > MENU_TOP_HALF_LOW_POSITION / 2;
    Animated.spring(
      this.state.menuTopAnimatedValue, {
        toValue: toLow ? 1 : 0,
        bounciness: 0,
        speed: 20,
      }
    ).start();
    this.topHalfTopOffset = toLow ? MENU_TOP_HALF_LOW_POSITION : MENU_TOP_HALF_UPPER_POSITION;
  }

  isVisible = () => {
    return this.visible;
  }

  setVisible(visible: bool, quick: bool = false) {
    this.visible = visible;

    if (visible) {
      this.container.setNativeProps({style: {top: 0}});
    }

    if (quick) {
      if (!this.visible) {
        this.container.setNativeProps({style: {top: 1000}});
      }
    }

    this.animate(this.state.animatedValue, (visible ? 1 : 0), () => {
      if (!this.visible) {
        this.container.setNativeProps({style: {top: 1000}});
      }
    });

    if (this.isTabPageVisible) {
      this.animate(this.state.menuTopAnimatedValue, 0);
      this.topHalf.setNativeProps({
        style: {
          top: 1000
        }
      });
      this.bottomHalf.setNativeProps({
        style: {
          borderRadius: 4,
        }
      });
    } else {
      this.topHalf.setNativeProps({
        style: {
          top: 0
        }
      });
      this.bottomHalf.setNativeProps({
        style: {
          borderRadius: 0,
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
        }
      });
      //首次启动app时, 动效提示用户层叠菜单
      if (this.showCascadeAnimate && this.visible) {
        this.animate(this.state.menuTopAnimatedValue, 1, () => {
          this.animate(this.state.menuTopAnimatedValue, 0.7, () => {
            this.animate(this.state.menuTopAnimatedValue, 1);
          });
        });
        this.showCascadeAnimate = false;
      } else {
        this.animate(this.state.menuTopAnimatedValue, visible ? 1 : 0);
      }
      if (!visible) {
        this.topHalfTopOffset = MENU_TOP_HALF_LOW_POSITION;
      }
    }
  }

  animate = (property ?: Animated.Value,
             value ?: number,
             callback ?: Function | null  = null) => {
    Animated.spring(
      property, {
        toValue: value,
        bounciness: 0,
        speed: 20,
      }
    ).start(() => callback && callback());
  }

  goForward = () => {
    this.doActionWithAnimation(this.props.forwardPressFn);
  }

  goHome = () => {
    this.doActionWithAnimation(this.props.homePressFn);
  }

  refresh = () => {
    this.doActionWithAnimation(this.props.refreshPressFn);
  }


  setting = () => {
    this.doActionWithoutAnimation(() => {
      this.props.pushSetting && this.props.pushSetting();
    });
  }

  handleHistory = () => {
    this.doActionWithoutAnimation(() => {
      this.props.pushHistory && this.props.pushHistory();
    });
  }

  handleDownload = () => {
    this.doActionWithoutAnimation(() => {
      this.props.pushDownload && this.props.pushDownload();
    });
  }

  doActionWithAnimation = (fn: Function) => {
    fn && fn();
    setTimeout(() => {
      this.setVisible(false);
    }, 100);
  }

  doActionWithoutAnimation = (fn: Function) => {
    setTimeout(() => {
      fn && fn();
    }, 0);
    setTimeout(() => {
      this.setVisible(false, true);
    }, 0);
  }
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    position: 'absolute',
    top:0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT + TOP_OFFSET,
    flexDirection: 'column',
    justifyContent: 'flex-end'
  },
  overlay: {
    flex: 1,
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT + TOP_OFFSET,
    position: 'absolute',
    backgroundColor: 'black',
    opacity: 0.4,
  },
  menu_content: {
    height: MENU_ROW_HEIGHT * 2, // 两行菜单
    borderRadius: 4,
    marginLeft: 12,
    marginRight: 12,
    flexDirection: 'column',
    justifyContent: 'space-around'
  },
})

const style = StyleSheet.create({
  top: {
    flex: 1,
    flexDirection: 'column',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: MENU_ROW_HEIGHT,
    borderRadius: 4,
    backgroundColor: 'white',
    zIndex: 10,
  },
  bottom: {
    flex: 1,
    flexDirection: 'column',
    position: 'absolute',
    left: 0,
    right: 0,
    top: MENU_ROW_HEIGHT,
    height: MENU_ROW_HEIGHT,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: 'white'
  },
  menu_content: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
})
