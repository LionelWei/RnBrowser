// @flow

import React, {PropTypes, Component } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  Navigator,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
} from 'react-native';
import {
  NAV_BAR_HEIGHT,
  BOTTOM_BAR_HEIGHT,
  SCREEN_HEIGHT
} from '../../utils/Consts'
import {connect} from 'react-redux'
import {Emitter} from '../../events/Emitter'
import WebPage from '../web/WebPage'
import TabTitleBar from './TabTitleBar'
import TabBottomBar from './TabBottomBar'
import Transitions from '../../animation/NavigatorAnimation'
import WebsiteIcon from './WebsiteIcon'
import {MAIN_WEBSITES} from './CommonWebSites'
import * as IMG from '../../assets/imageAssets'

import {SCREEN_WIDTH} from '../../utils/Consts'

class TabPage extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
  }
  titleBar = {};
  // tab页前进手势, 记录WebPage最后一次访问的网页
  lastUrlFromWeb = null;
  floatForwardButton;
  scrollDirection = {
    isHorizontal: false,
    isInited: false
  }
  touchX0;
  _panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 5;
    },
    onStartShouldSetResponderCapture: () => false,
    onMoveShouldSetResponderCapture: ()=> false,
    onPanResponderGrant: (evt, gestureState) => {
      this.touchX0 = gestureState.x0;
    },
    onPanResponderMove: (evt, gestureState) => {
      if (!this.scrollDirection.isInited) {
        this.scrollDirection.isInited = true;
        this.scrollDirection.isHorizontal = Math.abs(gestureState.dy) < 5
      }
      // 如果不是横向滑动, 返回
      // 如果没有进入过webpage, 返回
      if (!this.scrollDirection.isHorizontal
        || !this.lastUrlFromWeb
        || this.lastUrlFromWeb.length < 1) {
        return;
      }

      // 只有从边缘滑动时 才能开启手势功能
      if (!this.isPanFromEdge()) {
        return;
      }

      let dx = gestureState.dx;

      if (dx < 0) {
        let opacity = Math.min(Math.abs(dx) / 100, 1);
        let x = (Math.min(Math.abs(dx) / 100, 1) - 1) * 20;
        this.floatForwardButton.setNativeProps({style: {opacity: opacity, right: x}})
      }
    },
    onPanResponderTerminationRequest: (evt, gestureState) => true,
    onPanResponderRelease: (evt, gestureState) => {
      if (this.scrollDirection.isHorizontal && this.isPanFromEdge()) {
        let dx = gestureState.dx;
        if (dx < -100){
          let url = this.lastUrlFromWeb;
          if (url && url.length > 1) {
            this.gotoWeb(url);
          }
        }
      }
      this.resetFloatButton()
    },
    onPanResponderTerminate: (evt, gestureState) => {
      this.resetFloatButton()
    },
    onShouldBlockNativeResponder: (evt, gestureState) => true,
  });

  isPanFromEdge = () => {
    return (this.touchX0 < 30 || (SCREEN_WIDTH - this.touchX0) < 30)
  }

  getTitleText = () => {
    console.log('==== getTitleText: ' + this.titleBar.getTitleText());
    return this.titleBar.getTitleText();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }

  render() {
    console.log('******** Tabpage onRender count: ' + this.props.tabCount + '********');
    return (
      <View style={{
        flex: 1,
        flexDirection: 'column',
      }}>
        {this.renderTitleBar()}
        {this.renderContent()}
        {this.renderBottomBar()}
        {this.renderFloatForwardButton()}
      </View>
    )
  }

  renderTitleBar = () => {
    return <TabTitleBar
            ref={(titleBar) => this.titleBar = titleBar}
            onUrlChanged={this.onSearchUrlChanged}
            navigator={this.props.navigator}/>
  }

  renderBottomBar = () => {
    return <TabBottomBar
            menuPressFn={this.props.menuPressFn}
            tabPressFn={this.props.tabPressFn}
            />
  }

  renderContent() {
    return (
      <View
        style={{flex: 1}}
        {...this._panResponder.panHandlers}
        >
        <View style={{
          marginTop: 30,
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'flex-start'
        }}>
          {this.renderWebSites()}
        </View>
      </View>
    )
  }

  renderWebSites = () => {
    return (
      MAIN_WEBSITES.map((elem, index) => {
        return <WebsiteIcon
                {...this.props}
                key={index}
                pressFn={() => {this.gotoWeb(elem[0])}}
                desc={elem[1]}
                icon={elem[2]}/>
      })
    )
  }

  renderFloatForwardButton = () => {
    return (
      <View
        style={[styles.floatRight, {opacity: 0}]}
        ref={view => this.floatForwardButton = view}>
        <Image
          style={{
            width: 20,
            height: 20
          }}
          source={IMG.ICON_FORWARD_LIGHT}/>
      </View>
    )
  }

  resetFloatButton = () => {
    this.scrollDirection = {
      isHorizontal: false,
      isInited: false
    }
    this.floatForwardButton.setNativeProps({
      style: {opacity: 0}
    })
  }

  onHistoryUrlChanged = (url) => {
    // 将搜索页替换成web页
    console.log('### onHistoryUrlChanged url: ' + url);
    this.props.navigator.push({
      component: WebPage,
      scene: Transitions.NONE,
      id: this.props.id,
      url: url,
      menuPressFn: this.props.menuPressFn,
      tabPressFn: this.props.tabPressFn,
    })
  }

  onSearchUrlChanged = (url) => {
    // 将搜索页替换成web页
    console.log('### onSearchUrlChanged url: ' + url);
    this.props.navigator.replace({
      component: WebPage,
      scene: Transitions.NONE,
      id: this.props.id,
      url: url,
      menuPressFn: this.props.menuPressFn,
      tabPressFn: this.props.tabPressFn,
    })
  }

  gotoWeb = (url: string) => {
    console.log('=== gotoWeb url: ' + url);
    this.props.navigator.push({
      component: WebPage,
      scene: Transitions.NONE,
      id: this.props.id,
      url: url,
      menuPressFn: this.props.menuPressFn,
      tabPressFn: this.props.tabPressFn,
      onSaveLastUrl: this.onSaveLastUrl
    })
  }

  onSaveLastUrl = (url: string) => {
    this.lastUrlFromWeb = url;
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  floatRight:{
    position: 'absolute',
    top: SCREEN_HEIGHT / 2,
    right: 0,
    width: 50,
    height: 50,
    backgroundColor: '#808080ee',
    alignItems: 'center',
    justifyContent: 'center'
  },
})

function mapStateToProps(state) {
  return {
    tabCount: state.tabinfo.tabIds.length,
  }
}

module.exports = connect(
  mapStateToProps,
  null, null, {withRef: true})(TabPage)
