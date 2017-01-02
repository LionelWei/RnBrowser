/*
 * @flow */

import React, {PropTypes, Component } from 'react';
import {
  WebView,
  View,
  Text,
  Dimensions,
  StyleSheet,
  Platform,
  ToastAndroid
} from 'react-native';
import {NAV_BAR_HEIGHT ,BOTTOM_BAR_HEIGHT} from '../../utils/Consts'

import {connect} from 'react-redux'
import RNFetchBlob from 'react-native-fetch-blob'
import {Emitter} from '../../events/Emitter'
import {append as historyAppend} from '../../reducers/browsehistory'
import {startDownload, finishDownload} from '../../reducers/download'
import WebBottomBar from './WebBottomBar'
import WebTitleBar from './WebTitleBar'

// var DefaultWebView = Platform.OS === 'ios' ? WebView : require('./WebViewAndroid')

type NavState = {
  url: string,
  title: string,
  loading: bool,
  canGoBack: bool,
  canGoForward: bool,
}

class WebPage extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    url: PropTypes.string,
    menuPressFn: PropTypes.func,
    tabPressFn: PropTypes.func,
  }

  url = ''
  menuPopup = {};
  tabIndicatorPopup = {};
  navState: NavState = {};
  titleBar;
  bottomBar;
  webView;

  subscriptionWebReload = {};

  constructor() {
    super()
    this.subscriptionWebReload = Emitter.addListener('web_reload', this.onReload);
  }

  getTitleText = () => {
    return this.titleBar.getTitleText();
  }

  componentWillUnmount() {
    console.log('$$$$$$$$$ Web componentWillUnmount');
    this.subscriptionWebReload.remove();
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
        {this.renderTitleBar()}
        {this.renderWebView()}
        {this.renderBottomBar()}
      </View>
    )
  }

  renderTitleBar = () => {
    return <WebTitleBar
            ref={(titleBar) => this.titleBar = titleBar}
            navigator={this.props.navigator}
            onReload={() => this.webView.reload()}
            onStopLoading={() => this.webView.stopLoading()}
            onUrlChanged={this.onUrlChanged}
           />
  }

  renderWebView = () => {
    return (
      <WebView
        ref={web => this.webView = web}
        source={{uri: this.url}}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        decelerationRate="normal"
        onNavigationStateChange={this.onNavigationStateChange}
        onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
        startInLoadingState={true}
        scalesPageToFit={true}
        onStartDownload={this.onStartDownload}
      />
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
    this.webView.goForward();
  }

  onUrlChanged = (url) => {
    console.log('######### onUrlChanged: ' + url);
    if (url !== this.url) {
      this.url = url;
      this.forceUpdate()
    }
  }

  onNavigationStateChange = (navState: any) => {
    this.navState = {
      ...navState,
      title: simplifyTitle(navState.title),
    }

    this.titleBar.updateTitle(this.navState);
    this.bottomBar.updateBottom(this.props.tabCount, this.navState);

    // 记录浏览历史
    if (!navState.loading) {
      this.props.historyAppend(this.navState.url, this.navState.title);
    }
  };

  onStartDownload = (event) => {
    let title = event.nativeEvent.title;
    let url = event.nativeEvent.url;
    console.log('title: ' + event.nativeEvent.title + ', url: ' + event.nativeEvent.url);
    ToastAndroid.show('哈哈: ' + event.nativeEvent.title, ToastAndroid.SHORT)
    this.props.startDownload(url, title);
    const android = RNFetchBlob.android
    RNFetchBlob.config({
      addAndroidDownloads : {
        useDownloadManager : true,
        title : event.nativeEvent.title,
        description : 'An APK that will be installed',
        mime : 'application/vnd.android.package-archive',
        mediaScannable : true,
        notification : true,
      }
    })
    .fetch('GET', event.nativeEvent.url)
    .then((res) => {
      console.log(res.path());
      this.props.finishDownload(url, title);
      // android.actionViewIntent(res.path(), 'application/vnd.android.package-archive')
    })
  }

  onShouldStartLoadWithRequest = (ev: any) => {
    return true;
  };

}

function simplifyTitle(oldTitle: string) {
  var title = oldTitle;
  if (!title || title === '') {
    title = '加载中...'
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
      dispatch(historyAppend(url, simplifyTitle(title)))
    }
  }
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps, null, {withRef: true})(WebPage)
