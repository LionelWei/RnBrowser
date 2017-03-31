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
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native';
import {
  isIOS,
  SEARCH_BAR_HEIGHT,
  STATUS_BAR_HEIGHT,
  SCREEN_WIDTH,
  SCREEN_HEIGHT
} from '../../utils/Consts'

import {
  BOTTOM_BAR_HEIGHT_NORMAL,
  BOTTOM_BAR_HEIGHT_MIN,
} from './WebBottomBar'

import * as IMG from '../../assets/imageAssets'
import FS from '../../fs/fsutils'
import MIME from '../../fs/mime'

import {connect} from 'react-redux'
import RNFetchBlob from 'react-native-fetch-blob'
import {Emitter} from '../../events/Emitter'
import {append as historyAppend} from '../../reducers/browsehistory'
import {startDownload, finishDownload} from '../../reducers/download'
import Transitions from '../../animation/NavigatorAnimation'
import ProgressBar from '../../components/ProgressBar';
var RNFS = require('react-native-fs');
var dateFormat = require('dateformat');

var DefaultWebView = require('../../nativemodules/WebView')
const dirs = RNFetchBlob.fs.dirs;
const IMAGE_SAVE_TOAST_SUCCESS = "图片已保存";
const IMAGE_SAVE_TOAST_FAIL = "图片保存失败";
const FILE_SAVE_TOAST_SUCCESS = "下载已完成";
const FILE_SAVE_TOAST_FAIL = "下载失败";

const styles = StyleSheet.create({
  pbar: {
    left: 0,
    bottom: BOTTOM_BAR_HEIGHT_NORMAL,
    width: SCREEN_WIDTH,
    position: 'absolute'
  },
})

type NavState = {
  url ?: string,
  title ?: string,
  loading ?: bool,
  canGoBack ?: bool,
  canGoForward ?: bool,
}

const FAV_ICON_PREFIX = 'favicon: '
const WEB_SCROLLABLE = 'webScrollable: '
const FETCH_FAV_ICON = 'function icon() { \
  var ICON = 0; \
  var APPLE = 1; \
  var APPLE_PRECOMPOSED = 2; \
  var selectors = { "link[rel~=\'icon\']": ICON, \
      "link[rel=\'apple-touch-icon\']": APPLE, \
      "link[rel=\'apple-touch-icon-precomposed\']": APPLE_PRECOMPOSED \
    }; \
  function getIcon() { \
    var favicons = {}; \
    for (var selector in selectors) { \
      var icons = document.head.querySelectorAll(selector); \
      for (var i = 0; i < icons.length; i++) { \
        var href = icons[i].href; \
        favicons[href] = selectors[selector]; \
        if (href) { \
          return href; \
        } \
      } \
    } \
    return null;\
  } \
  return getIcon(); \
} \
window.postMessage(\'favicon: \' + icon()); \
var egameBrowserWebScrollable = false; \
window.addEventListener(\'scroll\', function(e) { \
  if (!egameBrowserWebScrollable) { \
    egameBrowserWebScrollable = true; \
    window.postMessage(\'webScrollable: true\'); \
  } \
}); \
'

class WebPage extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    url: PropTypes.string,
    onPushNewWebPage: PropTypes.func,
  }

  url = ''
  menuPopup = {};
  tabIndicatorPopup = {};
  navState: NavState = {};
  webView;
  progressBar;
  // 前进后退手势
  scrollDirection = {
    isHorizontal: false,
    isInited: false
  }
  // 全屏显示
  isFullScreen = false
  bodyPart;
  pbarPart;

  lastMoveY;
  webCanScroll = false;
  webLoadFinished = false;
  webDidFixWhenUnScrollable = false;

  webviewPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => true,
    onPanResponderGrant: (evt, gestureState) => {
      this.lastMoveY = gestureState.moveY;
    },
    onPanResponderMove: (evt, gestureState) => {
      if (!this.scrollDirection.isInited) {
        this.scrollDirection.isInited = true;
        this.scrollDirection.isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
      }
      // this.toggleByPanGesture(gestureState);
    },
    onPanResponderTerminationRequest: (evt, gestureState) => true,
    onPanResponderRelease: (evt, gestureState) => {
      this.toggleByPanGesture(gestureState);
      this.resetPanGesture();
    },
    onPanResponderTerminate: (evt, gestureState) => {
      this.toggleByPanGesture(gestureState);
      this.resetPanGesture();
    },
    onShouldBlockNativeResponder: (evt, gestureState) => true,
  });

  canScroll = () => {
    if (this.navState
      && this.navState.url
      && this.navState.url.includes("163.com")) {
      return false;
    }

    if (!this.webLoadFinished) {
      return true;
    } else {
      if (this.webCanScroll) {
        return true;
      }
    }

    // 目前只针对play.cn上的游戏做特殊处理, 淘宝和cnBeta都有问题
    if (this.navState
      && this.navState.url
      && this.navState.url.includes("play.cn")) {
      return false;
    }
    return true;
  }

  toggleByPanGesture = (gestureState) => {
    if (!this.scrollDirection.isHorizontal) {
      // let deltaY = gestureState.moveY - this.lastMoveY;
      let deltaY = gestureState.dy;
      let vy = gestureState.vy;
      if (deltaY > 5 || vy > 1) {
        this.toggleFullScreen(false);
      } else if (deltaY < -5 || vy < -1){
        this.toggleFullScreen(true);
      }
      this.lastMoveY = gestureState.moveY;
      return;
    }
  }

  getTitleText = () => {
    return this.navState.title || this.navState.url;
  }

  updateTitle = () => {
    console.log('webpage updateTitle, index: ' + this.props.index + ', title: ' + this.navState.title);
    let title = this.navState.title || this.navState.url;
    let url = this.navState.url;
    this.props.onTitleUpdate && this.props.onTitleUpdate(this.props.index, title, url);
  }

  showBottoBarWhole = (whole: bool) => {
    this.toggleFullScreen(!whole);
  }

  componentWillMount() {
    this.url = this.props.url;
    this.navState.url = this.props.url;
    this.isFullScreen = !this.props.isShowBottomBarWhole;
  }

  componentWillUnmount() {
    console.log('$$$$$$$$$ Web componentWillUnmount');
  }

  componentDidMount() {
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        {this.renderWebView()}
        {this.renderProgressBar()}
      </View>
    )
  }

  renderProgressBar = () => {
    let bottomOffset = this.props.isShowBottomBarWhole ? BOTTOM_BAR_HEIGHT_NORMAL : BOTTOM_BAR_HEIGHT_MIN;
    return (
      <View
        ref={(view) => this.pbarPart = view}
        style={[styles.pbar, {bottom: bottomOffset}]} >
        <ProgressBar
          ref={(pbar) => this.progressBar = pbar}
          width={SCREEN_WIDTH}
          height={2}
          borderWidth={0}
          hideAfterFinish={true} />
      </View>
    )
  }

  renderWebView = () => {
    let marginBottom = this.props.isShowBottomBarWhole ? BOTTOM_BAR_HEIGHT_NORMAL : BOTTOM_BAR_HEIGHT_MIN;
    return (
      <View style={{
          flex: 1,
          marginBottom: marginBottom,
        }}
        ref={view => this.bodyPart = view}
        {...this.webviewPanResponder.panHandlers}>
        <DefaultWebView
          ref={web => this.webView = web}
          source={{uri: this.url}}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          injectedJavaScript={FETCH_FAV_ICON}
          onNavigationStateChange={this.onNavigationStateChange}
          onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
          startInLoadingState={false}
          onLoadStart={this.onLoadStart}
          onLoadEnd={this.onLoadEnd}
          onStartDownload={this.onStartDownload}
          onProgressChange={this.onProgressChange}
          onOverrideUrlLoading={this.onOverrideUrlLoading}
          onLongPress={this.onLongPress}
          onMessage={this.onWebMessage}
        />
      </View>
    );
  }

  resetPanGesture = () => {
    this.scrollDirection = {
      isHorizontal: false,
      isInited: false
    }
  }

  toggleFullScreen = (isFullScreen: bool) => {
    if (this.isFullScreen === isFullScreen) {
      return;
    }
    this.isFullScreen = isFullScreen || false;

    if (!this.canScroll()) {
      if (!this.webDidFixWhenUnScrollable) {
        this.webDidFixWhenUnScrollable = true;
        if (this.isFullScreen) {
          this.increaseWebSize();
          return;
        }
      }

      if (this.isFullScreen) {
        this.pbarPart.setNativeProps({
          style: {
            bottom: BOTTOM_BAR_HEIGHT_MIN,
          }
        })
        setTimeout(() => {
          this.onBottomBarAsWhole(false);
        }, 50);
      } else {
        this.onBottomBarAsWhole(true);
        setTimeout(() => {
          this.pbarPart.setNativeProps({
            style: {
              bottom: BOTTOM_BAR_HEIGHT_NORMAL,
            }
          })
        }, 50);
      }
      return;
    }

    this.isFullScreen ? this.increaseWebSize() : this.decreaseWebSize();
  }

  increaseWebSize = () => {
    this.bodyPart.setNativeProps({
      style: {
        marginBottom: BOTTOM_BAR_HEIGHT_MIN,
      }
    })
    this.pbarPart.setNativeProps({
      style: {
        bottom: BOTTOM_BAR_HEIGHT_MIN,
      }
    })
    setTimeout(() => {
      this.onBottomBarAsWhole(false);
    }, 50);
  }

  decreaseWebSize = () => {
    this.onBottomBarAsWhole(true);
    setTimeout(() => {
      this.pbarPart.setNativeProps({
        style: {
          bottom: BOTTOM_BAR_HEIGHT_NORMAL,
        }
      })
      this.bodyPart.setNativeProps({
        style: {
          marginBottom: BOTTOM_BAR_HEIGHT_NORMAL,
        }
      })
    }, 50);
  }

  back = () => {
    if (isIOS && this.navState.canGoBack) {
      this.webView.goBack();
      setTimeout(() => {
        Emitter.emit('enableForward', true);
      }, 200);
    } else {
      this.props.navigator.jumpBack();
    }
  }

  canGoForward = () => {
    return isIOS && !!this.navState.canGoForward;
  }

  forward = () => {
    if (isIOS) {
      if (this.navState.canGoForward) {
        this.webView.goForward();
      }
    } else {
      this.props.navigator.jumpForward();
    }
  }

  refresh = () => {
    this.webView && this.webView.reload();
  }

  resume = () => {
    this.webView && this.webView.resume();
  }

  pause = () => {
    this.webView && this.webView.pause();
  }

  updateBottomNavState = (navState) => {
    this.props.onWebStateUpdate && this.props.onWebStateUpdate(this.props.index, navState);
  }

  onHistoryUrlChanged = (url) => {
    console.log('######### web onHistoryUrlChanged: ' + url);
    this.props.onPushNewWebPage && this.props.onPushNewWebPage(url);
  }

  onNavigationStateChange = (navState: any) => {
    console.log('onNavigationStateChange: ' + JSON.stringify(navState, null, 2));
    // 只有当获取到标题且loading为false时, 才是loading结束
    // 否则可能会误判
    let realLoading:bool = true;
    if (navState.title && navState.title.length > 0 && !navState.loading) {
      realLoading = false;
    }

    this.navState = {
      ...navState,
      loading: realLoading,
      title: simplifyTitle(navState.title, navState.url),
    }

    // console.log('=== NavState: ');
    // console.log(JSON.stringify(navState, null, 2));
    this.updateBottomNavState(this.navState);
    this.updateTitle();

    // 不要重复添加历史记录, 防止覆盖
    // if (!this.navState.loading) {
    //   this.props.historyAppend({
    //     url: this.navState.url,
    //     title: this.navState.title,
    //   });
    // }
  };

  onProgressChange = (progress: number) => {
    this.progressBar && this.progressBar.updateProgress(progress)
  }

  onOverrideUrlLoading = (url: string, mimeType: string) => {
    console.log('url: ' + url + ', mimeType: ' + mimeType);
    this.pushNewWeb(url);
  }

  onLongPress = (event: Object) => {
    if (event.mime === 'image') {
      this.props.webLongPressFn && this.props.webLongPressFn(event);
    }
  }

  onWebMessage = (event: Object) => {
    let data = event.nativeEvent.data;

    if (data.startsWith(FAV_ICON_PREFIX)) {
      let iconUrl = null;
      if (data.length > FAV_ICON_PREFIX.length + 2) {
        iconUrl = data.substr(FAV_ICON_PREFIX.length);
        console.log('iconUrl: ' + iconUrl);
      }

      if (iconUrl && iconUrl.endsWith('ico')) {
        let realIconUrl = iconUrl;
        iconUrl = null;
      }
      // 获取到favicon时表示页面加载完毕, 添加浏览记录
      this.props.historyAppend({
        url: this.navState.url,
        title: this.navState.title,
        favIcon: iconUrl,
      });
    }

    if (data.startsWith(WEB_SCROLLABLE)) {
      this.webCanScroll = true;
      console.log(' WEB_SCROLLABLE: ' + data);
    }
  }

  onLoadStart = (e) => {
    this.webCanScroll = false;
    this.webLoadFinished = false;
    this.webDidFixWhenUnScrollable = false;
  }

  onLoadEnd = (e) => {
    this.webLoadFinished = true;
  }

  pushNewWeb = (url: string) => {
    this.props.onPushNewWebPage && this.props.onPushNewWebPage(url);
  }

  onShouldStartLoadWithRequest = (ev: any) => {
    return true;
  };

  onBottomBarAsWhole = (whole: bool) => {
    this.props.onBottomBarAsWhole && this.props.onBottomBarAsWhole(this.props.index, whole);
  }

  onStartDownload = (event) => {
    let title = event.nativeEvent.title;
    let url = event.nativeEvent.url;
    console.log('title: ' + event.nativeEvent.title + ', url: ' + event.nativeEvent.url);
    this.startDownload({title: title, url: url, isImage: false});
  }

  saveIco = (webUrl: string, title: string, iconUrl: string) => {
    console.log('saveIco: ' + iconUrl);
    // .ico解析有问题, TODO
    if (iconUrl.endsWith('ico')) {
      return;
    }
    let start = iconUrl.indexOf('//');
    if (~start) {
      return;
    }
    let iconName = iconUrl.substr(start + 2);
    let end = iconName.indexOf('/');
    if (~end) {
      iconName = iconName.substr(0, end);
    }
    iconName += '.png';
    let iconPath = dirs.CacheDir + '/' + iconName;

    console.log('ico Path: ' + iconPath);
    RNFetchBlob.fs.exists(iconPath)
    .then((exist) => {
      if (exist) {
        this.props.historyAppend({
          url: webUrl,
          title: title,
          favIcon: iconPath,
        })
      } else {
        RNFetchBlob.config({
          path: iconPath,
        })
        .fetch('GET', iconUrl)
        .then((res) => {
          console.log('icon finished: ' + iconPath);
          this.props.historyAppend({
            url: webUrl,
            title: title,
            favIcon: iconPath,
          })
        }, (err) => {
        });
      }
    })
    .catch(() => {});
  }

  saveImage = (url: string) => {
    if (!url || url.length === 0) {
      console.log('url is invalid');
      return;
    }
    let title = generateFileName(url);
    if (!title) {
      console.log('image format is invalid');
      return;
    }
    this.startDownload({title: title, url: url, isImage: true});

    function generateFileName(url: string) {
      var formats = ['.jpg', '.bmp', '.png', '.jpeg'];
      var format = null;
      formats.forEach((e) => {
        if (url.includes(e) || url.toLowerCase().includes(e)) {
          format = e;
        }
      })
      if (!format) {
        return null;
      }
      return dateFormat(new Date(), 'yyyy-mm-dd-HH-MM-ss-l') + format;
    }
  }

  startDownload = (event) => {
    let {url, title, isImage} = event;
    let androidConfig = null;
    let successToast = isImage ? IMAGE_SAVE_TOAST_SUCCESS : FILE_SAVE_TOAST_SUCCESS;
    let failToast = isImage ? IMAGE_SAVE_TOAST_FAIL : FILE_SAVE_TOAST_FAIL;

    let destPath = dirs.DownloadDir + '/' + title;
    let mime = FS.getMimeByPath(title);
    this.props.startDownload(url, title, destPath);
    console.log('startDownload: ' + destPath);

    if (!isImage) {
      ToastAndroid.show(title + '下载中... ', ToastAndroid.SHORT)
      // 不加平台判断也没关系, 这里为了指明用途.
      if (!isIOS) {
        androidConfig = {
          useDownloadManager : true,
          title : title,
          mediaScannable : true,
          notification : true,
          description: title,
          mime: mime,
          path: destPath,
        };
      }
    }

    RNFetchBlob.config({
      addAndroidDownloads : androidConfig,
      path: destPath,
    })
    .fetch('GET', url)
    .then((res) => {
      console.log('finished: ' + destPath);
      this.props.finishDownload(url, title, destPath);
      if (!isIOS && FS.getMimeByPath(destPath) === MIME['.apk']) {
        FS.open(destPath)
        .then((msg) => {
            console.log('success!!')
        },() => {
            console.log('error!!')
        });
      } else {
        ToastAndroid.show(successToast, ToastAndroid.SHORT);
      }
      // 暂不支持断点续传 需要考虑的问题太多
      // RNFS.moveFile(res.path(), destPath).then((res) => {
      //   console.log('finished: ' + destPath);
      //   this.props.finishDownload(url, title, destPath);
      //   ToastAndroid.show(successToast, ToastAndroid.SHORT);
      // });
    }, (err) => {
      ToastAndroid.show(failToast, ToastAndroid.SHORT);
    });
  }
}

function simplifyTitle(oldTitle: string, url: string) {
  var title = oldTitle;
  if (!title || title === '') {
    return url;
  }
  return title;
}

function mapStateToProps(state) {
  return {
  }
}

function mapDispatchToProps(dispatch) {
  return {
    startDownload: (url, title, path) => {
      dispatch(startDownload(url, title, path))
    },
    finishDownload: (url, title, path) => {
      dispatch(finishDownload(url, title, path))
    },
    historyAppend: (webInfo) => {
      dispatch(historyAppend(webInfo))
    }
  }
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps, null, {withRef: true})(WebPage)
