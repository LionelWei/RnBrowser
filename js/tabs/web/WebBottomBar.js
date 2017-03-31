/* @flow */

import React, { Component, PropTypes} from 'react'

import {
  Image,
  View,
  Text,
  StyleSheet,
  Navigator,
  TouchableHighlight,
  TouchableOpacity,
  Animated,
  Easing,
  AsyncStorage,
  PixelRatio,
} from 'react-native'
import {
  isIOS,
  BOTTOM_BAR_HEIGHT
} from '../../utils/Consts'

import {connect} from 'react-redux'
import TouchableButton from '../../components/TouchableButton'
import TabCount from '../../components/TabCount'
import Transitions from '../../animation/NavigatorAnimation'
import * as IMG from '../../assets/imageAssets'

const BOTTOM_BAR_HEIGHT_NORMAL = BOTTOM_BAR_HEIGHT;
const BOTTOM_BAR_HEIGHT_MIN = 20;
const BOTTOM_BAR_WITH_PADDING = BOTTOM_BAR_HEIGHT_NORMAL + 4;

const styles = StyleSheet.create({
  bottombar: {
    height: BOTTOM_BAR_HEIGHT,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderTopWidth: 1 / PixelRatio.get(),
    borderTopColor: '#f1f2f3'
  },
  shadow: {
    elevation: 4,
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {
      height: 2,
    },
  },
})

class WebBottomBar extends Component {
  static propTypes = {
    navigator: PropTypes.object,
    tabPressFn: PropTypes.func,
    menuPressFn: PropTypes.func,
    homePressFn: PropTypes.func,
    onBack: PropTypes.func,
    onForward: PropTypes.func,
  };

  animatedCurrentValue = 1;

  navState = {};
  flexLayout = {
    title: 1,
    button: 1,
    titleTranslateX: 76,
  };

  state = {
    url: '',
    title: '',
    loading: true,
    canGoForward: false,
    canGoBack: true,
    visible: true,
    animatedValue: new Animated.Value(1),
    animatedFontSize: new Animated.Value(1),
  }

  updateNavState(navState: Object) {
    this.navState = {
      url: this.nonEmpty(navState.url, this.navState.url),
      title: this.nonEmpty(navState.title, this.navState.title),
      loading: navState.loading,
      canGoForward: navState.canGoForward,
    }
    this.setState({
      url: this.navState.url,
      title: this.navState.title,
      loading: this.navState.loading,
      canGoForward: this.navState.canGoForward,
    })
  }

  show = () => {
    this.setVisible(true)
  }

  hide = () => {
    this.setVisible(false)
  }

  setVisible(visible: bool) {
    if (this.state.visible === visible) {
      return;
    }

    this.setState({
      visible: visible
    })

    Animated.spring(
      this.state.animatedValue, {
        toValue: visible ? 1 : 0,
        bounciness: 0,
        speed: 20,
      }
    ).start();
    Animated.timing(
      this.state.animatedFontSize, {
      toValue: visible ? 1 : 0, // 目标值
      duration: 200, // 动画时间
      easing: Easing.Linear // 缓动函数
    }).start();
  }

  componentWillMount() {
    if (!isIOS) {
      this.flexLayout = {
        title: 2,
        button: 1,
        titleTranslateX: 76 / 3 * 2
      };
    }
    this.state.animatedValue.addListener(({value}) => {
      this.animatedCurrentValue = value;
    })
  }

  componentWillUnmount() {
    this.state.animatedValue.removeAllListeners();
  }

  shouldComponentUpdate(nextProps: Object, nextState: Object) {
    if (nextState.url !== this.state.url
      || nextState.title !== this.state.title
      || nextState.loading !== this.state.loading
      || nextState.canGoForward !== this.state.canGoForward) {
      return true;
    }
    return false;
  }

  render() {
    return (
      <View style={[styles.bottombar, styles.shadow]}>
        <Animated.View style={[{
          flex: this.flexLayout.title,
          paddingLeft: 16,
          alignItems: 'center'
        }, {
          transform: [{
            translateY: this.state.animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [34 - BOTTOM_BAR_HEIGHT, 0]
            })
          }, {
            translateX: this.state.animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [this.flexLayout.titleTranslateX, 0]
            })
          }]
        }]}>
          {this.renderTitle()}
        </Animated.View>
        <Animated.View style={[{flex: this.flexLayout.button}, styles.bottombar, {
          transform: [{
            translateY: this.state.animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [BOTTOM_BAR_HEIGHT, 0]
            })
          }]
        }]}>

          {this.renderBack()}

          <TabCount
            pressFn={this.props.tabPressFn}
            longPressFn={this.props.tabLongPressFn} />

          <TouchableButton
            pressFn={this.props.menuPressFn}
            normalBg = {IMG.ICON_MENU_NORMAL} />

          {
            /*
            <TouchableButton
              pressFn = {this.props.homePressFn}
              normalBg = {IMG.ICON_HOME_NORMAL} />
              */
          }
        </Animated.View>
      </View>
    )
  }

  renderTitle = () => {
    return <View style={{
              flex: 1,
            }}>
            <TouchableOpacity
              style={{
                flex: 1,}}
              onPress={() => {
                if (this.animatedCurrentValue < 1) {
                  return;
                }
                console.log('title url: ' + this.state.url);
                this.props.onSearch(this.state.url)
              }}>
              <View style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Animated.Text
                  style={[{
                    color: 'black',
                    fontSize: this.state.animatedFontSize.interpolate({
                    inputRange: [0,1],
                    outputRange: [10, 14]
                  })},]}
                  includeFontPadding={false}
                  textAlignVertical={true}
                  numberOfLines={1}>
                    {this.state.title}
                </Animated.Text>
              </View>
            </TouchableOpacity>
            </View>
  }

  renderBack = () => {
    return (
      isIOS
      ? <TouchableButton
          enabled = {this.state.canGoBack}
          pressFn = {this.back}
          normalBg = {IMG.ICON_BACK_NORMAL} />
      : null
    );
  }

  back = () => {
    this.props.onBack && this.props.onBack()
  }

  forward = () => {
    this.props.onForward && this.props.onForward();
  }

  nonEmpty = (expected: string, original: string) => {
    return (expected && expected !== '' && expected !== ' ') ? expected : original;
  }
}

module.exports = {
  WebBottomBar,
  BOTTOM_BAR_HEIGHT_NORMAL,
  BOTTOM_BAR_HEIGHT_MIN,
}
