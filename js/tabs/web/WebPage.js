/*
 * @flow */

import React, {PropTypes, Component } from 'react';
import {
  WebView,
  Image,
  View,
  Text,
  StyleSheet,
  PanResponder,
  ToastAndroid,
  AsyncStorage,
  TouchableOpacity
} from 'react-native';
import {
  isIOS,
  NAV_BAR_HEIGHT,
  BOTTOM_BAR_HEIGHT,
  STATUS_BAR_HEIGHT,
  SCREEN_WIDTH,
  SCREEN_HEIGHT
} from '../../utils/Consts'

import {connect} from 'react-redux'
import RNFetchBlob from 'react-native-fetch-blob'
import {Emitter} from '../../events/Emitter'
import {append as historyAppend} from '../../reducers/browsehistory'
import {startDownload, finishDownload} from '../../reducers/download'
import WebBottomBar from './WebBottomBar'
import WebTitleBar from './WebTitleBar'
import ProgressBar from '../../components/ProgressBar';
import * as IMG from '../../assets/imageAssets'

var DefaultWebView = require('../../nativemodules/WebView')
const dirs = RNFetchBlob.fs.dirs

const styles = StyleSheet.create({
  titlebar: {
    left: 0,
    top: 0,
    height: NAV_BAR_HEIGHT,
    width: SCREEN_WIDTH,
    flexDirection: 'column',
    backgroundColor: 'white',
    position: 'absolute'
  },
  bottombar: {
    left: 0,
    bottom: 0,
    height: BOTTOM_BAR_HEIGHT,
    width: SCREEN_WIDTH,
    flexDirection: 'column',
    position: 'absolute'
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
  floatLeft:{
    position: 'absolute',
    top: SCREEN_HEIGHT / 2,
    left: 0,
    width: 50,
    height: 50,
    backgroundColor: '#808080ee',
    alignItems: 'center',
    justifyContent: 'center'
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
  circle: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 4 / 5,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00000077',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

type NavState = {
  url: string,
  title: string,
  loading: bool,
  canGoBack: bool,
  canGoForward: bool,
}

const __AUTO_FULLSCREEN__ = false
const FLOAT_FULLSCREEN_TOP = 'FLOAT_FULLSCREEN_TOP'
const FLOAT_FULLSCREEN_RIGHT = 'FLOAT_FULLSCREEN_RIGHT'

class WebPage extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    url: PropTypes.string,
    menuPressFn: PropTypes.func,
    tabPressFn: PropTypes.func,
    onSaveLastUrl: PropTypes.func,
  }


  url = ''
  menuPopup = {};
  tabIndicatorPopup = {};
  navState: NavState = {};
  titleBar;
  bottomBar;
  webView;
  progressBar;
  // 前进后退手势
  floatBackButton;
  floatForwardButton;
  floatFullScreenButton;
  scrollDirection = {
    isHorizontal: false,
    isInited: false
  }
  // 全屏显示
  isFullScreen = false
  fullScreenPrefValue = false
  topPart;
  bottomPart;
  bodyPart;


  subscriptionIsFullScreen = {};
  touchX0;

  webviewPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => true,
    onPanResponderGrant: (evt, gestureState) => {
      // 开始手势操作。给用户一些视觉反馈，让他们知道发生了什么事情！

      console.log('onPanResponderGrant');
      if (this.fullScreenPrefValue !== this.isFullScreen) {
        this.toggleFullScreen(this.fullScreenPrefValue)
      }
      this.touchX0 = gestureState.x0;
      // gestureState.{x,y}0 现在会被设置为0
    },
    onPanResponderMove: (evt, gestureState) => {
      // console.log('onPanResponderMove: ' + 'vy: ' + gestureState.vy);
      console.log('onPanResponderMove: ' + 'x0: ' + gestureState.x0);

      if (!this.scrollDirection.isInited) {
        this.scrollDirection.isInited = true;
        this.scrollDirection.isHorizontal = Math.abs(gestureState.dy) < 5
      }

      if (!this.scrollDirection.isHorizontal) {
        return;
      }

      // 只有从边缘滑动时 才能开启手势功能
      if (!this.isPanFromEdge()) {
        return;
      }

      let dx = gestureState.dx;
      let dy = gestureState.dy;

      if (dx >= 0) {
        this.floatForwardButton.setNativeProps({style: {opacity: 0}})
        let opacity = Math.min(dx / 100, 1)
        let x = (Math.min(dx / 100, 1) - 1) * 20;
        this.floatBackButton.setNativeProps({style: {opacity: opacity, left: x}})
      } else {
        this.floatBackButton.setNativeProps({style: {opacity: 0}})
        if (this.navState.canGoForward) {
          let opacity = Math.min(Math.abs(dx) / 100, 1);
          let x = (Math.min(Math.abs(dx) / 100, 1) - 1) * 20;
          this.floatForwardButton.setNativeProps({style: {opacity: opacity, right: x}})
        }
      }
      // 从成为响应者开始时的累计手势移动距离为gestureState.d{x,y}
    },
    onPanResponderTerminationRequest: (evt, gestureState) => true,
    onPanResponderRelease: (evt, gestureState) => {
      if (this.scrollDirection.isHorizontal && this.isPanFromEdge()) {
        let dx = gestureState.dx;
        if (dx > 100) {
          this.back()
        } else if (dx < -100){
          this.forward()
        }
      }
      this.resetFloatButton()
    },
    onPanResponderTerminate: (evt, gestureState) => {
      this.resetFloatButton()
      // 另一个组件已经成为了新的响应者，所以当前手势将被取消。
    },
    onShouldBlockNativeResponder: (evt, gestureState) => {
      // 返回一个布尔值，决定当前组件是否应该阻止原生组件成为JS响应者
      // 默认返回true。目前暂时只支持android。
      return true;
    },
  });

  isPanFromEdge = () => {
    return (this.touchX0 < 30 || (SCREEN_WIDTH - this.touchX0) < 30)
  }

  floatTop;
  floatRight;
  floatInitTop;
  floatInitRight;
  floatFullScreenPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dx) > 5,
    onPanResponderGrant: ()=>{
      this.floatInitTop = this.floatTop
      this.floatInitRight = this.floatRight
    },
    onPanResponderMove: (evt,gs)=>{
      this.floatTop = Math.min(Math.max(this.floatInitTop + gs.dy, NAV_BAR_HEIGHT),
                            SCREEN_HEIGHT - NAV_BAR_HEIGHT - BOTTOM_BAR_HEIGHT);
      this.floatRight = Math.min(Math.max(this.floatInitRight - gs.dx, 10),
                            SCREEN_WIDTH - 50);
      this.floatFullScreenButton.setNativeProps({
        style: {top: this.floatTop, right: this.floatRight}})
    },
    onPanResponderRelease: (evt,gs)=>{
      let top = String(Math.round(this.floatTop))
      let right = String(Math.round(this.floatRight))
      AsyncStorage.multiSet([
        [FLOAT_FULLSCREEN_TOP, top],
        [FLOAT_FULLSCREEN_RIGHT, right],
      ])
    }
  });

  constructor() {
    super()
    this.subscriptionIsFullScreen = Emitter.addListener('is_fullscreen',
                                    (...args) => {
                                      this.fullScreenPrefValue = args[0]
                                      this.toggleFullScreen(this.fullScreenPrefValue)
                                    });
  }

  getTitleText = () => {
    return this.titleBar.getTitleText();
  }

  componentWillUnmount() {
    console.log('$$$$$$$$$ Web componentWillUnmount');
    this.props.onSaveLastUrl && this.props.onSaveLastUrl(this.navState.url)
    this.subscriptionIsFullScreen.remove();
  }

  componentDidMount() {
    AsyncStorage.getItem('IS_FULLSCREEN', (err, result) => {
      console.log('isFullScreen ' + result);
      this.fullScreenPrefValue = result === '1' ? true : false;
      this.toggleFullScreen(this.fullScreenPrefValue);
    })
    AsyncStorage.multiGet(
      [FLOAT_FULLSCREEN_TOP, FLOAT_FULLSCREEN_RIGHT])
      .then(arr => {
        console.log(arr);
        this.floatTop = +arr[0][1] || SCREEN_HEIGHT * 4 / 5;
        this.floatRight = +arr[1][1] || 10;
        console.log('float position top: ' + this.floatTop + ', right: ' + this.floatRight);
        this.floatFullScreenButton.setNativeProps({
          style: {top: this.floatTop, right: this.floatRight}})
      })
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.tabCount !== this.props.tabCount) {
      this.bottomBar.updateBottom(nextProps.tabCount, this.navState);
      return false;
    }

    return false;
  }

  componentWillMount() {
    this.url = this.props.url
  }

  render() {
    return (
      <View style={{flex: 1}}>
        {this.renderWebView()}
        <View
          ref={view => this.topPart = view}
          style={[styles.titlebar,]} >
          {this.renderTitleBar()}
          {this.renderProgressBar()}
        </View>
        <View
          ref={view => this.bottomPart = view}
          style={[styles.bottombar,]} >
          {this.renderBottomBar()}
        </View>
        {this.renderFloatBackButton()}
        {this.renderFloatForwardButton()}
        {this.renderFloatSettingButton()}
      </View>
    )
  }

  renderTitleBar = () => {
    return (
      <WebTitleBar
        ref={(titleBar) => this.titleBar = titleBar}
        navigator={this.props.navigator}
        onReload={() => this.webView.reload()}
        onStopLoading={() => this.webView.stopLoading()}
        onUrlChanged={this.onSearchUrlChanged}
      />
    )
  }

  renderProgressBar = () => {
    return (
      <ProgressBar
        ref={(pbar) => this.progressBar = pbar}
        width={SCREEN_WIDTH}
        height={2}
        borderWidth={0}
        hideAfterFinish={true} />
    )
  }

  renderWebView = () => {
    return (
      <View style={{
        flex: 1,
        marginTop: NAV_BAR_HEIGHT,
        marginBottom: BOTTOM_BAR_HEIGHT}}
        ref={view => this.bodyPart = view}>
        <DefaultWebView
          {...this.webviewPanResponder.panHandlers}
          ref={web => this.webView = web}
          source={{uri: this.url}}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onNavigationStateChange={this.onNavigationStateChange}
          onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
          startInLoadingState={false}
          onStartDownload={this.onStartDownload}
          onProgressChange={this.onProgressChange}
        />
      </View>
    );
  }

  renderBottomBar = () => {
    return (
      <WebBottomBar
        ref={(bottomBar) => this.bottomBar = bottomBar}
        menuPressFn={() => this.props.menuPressFn(false)}
        tabPressFn={this.props.tabPressFn}
        homePressFn={() => this.props.navigator.pop()}
        onBack={this.back}
        onForward={this.forward}/>
    )
  }

  renderFloatBackButton = () => {
    return (
      <View
        style={[styles.floatLeft, {opacity: 0}]}
        ref={view => this.floatBackButton = view}>
        <Image
          style={{
            width: 20,
            height: 20
          }}
          source={IMG.ICON_BACK_LIGHT}/>
      </View>
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

  renderFloatSettingButton = () => {
    let opacity = this.isFullScreen ? 1 : 0
    return (
      <View
        style={[styles.circle, {opacity: opacity}]}
        ref={view => this.floatFullScreenButton = view}
        {...this.floatFullScreenPanResponder.panHandlers}>
        <TouchableOpacity
          onPress={() => {this.toggleFullScreen(false)}}>
          <View
            style={{width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center'}}>
            <Image
              style={{
                width: 20,
                height: 20
              }}
              source={IMG.ICON_FLOAT_FULLSCREEN_NORMAL}/>
          </View>
        </TouchableOpacity>
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
    this.floatBackButton.setNativeProps({
      style: {opacity: 0}
    })
  }

  toggleFullScreen = (isFull: bool) => {
    console.log('toggleFullScreen: isFullScreen: ' + isFull);
    let isFullScreen = isFull
    if (this.isFullScreen === isFullScreen) {
      return;
    }
    this.isFullScreen = isFullScreen || false;

    if (!this.isFullScreen) {
      this.bodyPart.setNativeProps({
        style: {
          marginTop: NAV_BAR_HEIGHT,
          marginBottom: BOTTOM_BAR_HEIGHT,
        }
      })
      this.floatFullScreenButton.setNativeProps({style: {opacity: 0}})
      this.titleBar && this.titleBar.show()
      setTimeout(() => {
        this.topPart.setNativeProps({style: {top: 0, height: NAV_BAR_HEIGHT}})
        this.bottomPart.setNativeProps({style: {height: BOTTOM_BAR_HEIGHT}})
      }, 100)
    }
    else {
      this.bodyPart.setNativeProps({
        style: {
          marginTop: 0,
          marginBottom: 0,
        }
      })
      this.floatFullScreenButton.setNativeProps({style: {opacity: 1}})
      this.titleBar && this.titleBar.hide()
      setTimeout(() => {
        this.topPart.setNativeProps({style: {top: 0, height: 2}})
        this.bottomPart.setNativeProps({style: {height: 0}})
      }, 100)
    }
  }

  onReload = () => {
    if (this.props.id === this.props.currentTabId) {
      this.webView.reload();
    }
  }

  back = () => {
    if (this.navState.canGoBack) {
      this.webView.goBack();
    } else {
      this.props.navigator.pop();
    }
  }

  forward = () => {
    if (this.navState.canGoForward) {
      this.webView.goForward();
    }
  }

  updateTitle = (navState) => {
    this.titleBar && this.titleBar.updateTitle(this.navState);
  }

  updateBottom = (tabCount, navState) => {
    this.bottomBar && this.bottomBar.updateBottom(tabCount, navState);
  }

  onHistoryUrlChanged = (url) => {
    console.log('######### web onHistoryUrlChanged: ' + url);
    if (url !== this.url) {
      this.url = url;
      this.forceUpdate()
    }
  }

  onSearchUrlChanged = (url) => {
    console.log('######### web onSearchUrlChanged: ' + url);
    // 搜索页退栈
    this.props.navigator.pop()
    if (url !== this.url) {
      this.url = url;
      this.forceUpdate()
    }
  }

  onNavigationStateChange = (navState: any) => {
    // 只有当获取到标题且loading为false时, 才是loading结束
    // 否则可能会误判
    let readLoading:bool = true;
    if (navState.title && navState.title.length > 0 && !navState.loading) {
      readLoading = false;
    }

    this.navState = {
      ...navState,
      loading: readLoading,
      title: simplifyTitle(navState.title, navState.url),
    }

    console.log('=== NavState: ');
    console.log(JSON.stringify(navState, null, 2));
    this.updateTitle(this.navState)
    this.updateBottom(this.props.tabCount, this.navState);
    // 记录浏览历史
    if (!navState.loading) {
      this.props.historyAppend(this.navState.url, this.navState.title);
    }
  };

  onStartDownload = (event) => {
    let title = event.nativeEvent.title;
    let url = event.nativeEvent.url;
    console.log('title: ' + event.nativeEvent.title + ', url: ' + event.nativeEvent.url);
    ToastAndroid.show(title + '下载中... ', ToastAndroid.SHORT)
    this.props.startDownload(url, title);
    console.log('path: ' + dirs.DownloadDir + '/' + title);
    RNFetchBlob.config({
      addAndroidDownloads : {
        useDownloadManager : true,
        title : event.nativeEvent.title,
        mime : 'application/vnd.android.package-archive',
        mediaScannable : true,
        notification : true,
        path: dirs.DownloadDir + '/' + title,
      },
    })
    .fetch('GET', event.nativeEvent.url)
    .then((res) => {
      console.log(res.path());
      this.props.finishDownload(url, title);
      // android.actionViewIntent(res.path(), 'application/vnd.android.package-archive')
    })
  }

  onProgressChange = (progress: number) => {
    this.progressBar && this.progressBar.updateProgress(progress)
  }

  onShouldStartLoadWithRequest = (ev: any) => {
    return true;
  };

}

function simplifyTitle(oldTitle: string, url: string) {
  var title = oldTitle;
  if (!title || title === '') {
    return url;
  }
  return (title.length > 15
        && (subWithToken('_')
        || subWithToken(',')
        || subWithToken(' ')
        || subWithToken('|')
        || subWithToken('-')))
        || title

  function subWithToken(token: string) {
    var index = -1;
    if ((index = title.indexOf(token)) != -1) {
      return title.substr(0, index);
    }
    return null
  }
}

function mapStateToProps(state) {
  return {
    currentTabId: state.tabinfo.currentTabId,
    tabCount: state.tabinfo.tabIds.length,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    startDownload: (url, title) => {
      dispatch(startDownload(url, title))
    },
    finishDownload: (url, title) => {
      dispatch(finishDownload(url, title))
    },
    historyAppend: (url, title) => {
      dispatch(historyAppend(url, simplifyTitle(title, url)))
    }
  }
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps, null, {withRef: true})(WebPage)
