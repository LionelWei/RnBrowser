/*
 * refer to https://facebook.github.io/react-native/docs/webview.html
 * @flow */

import React, {PropTypes, Component } from 'react'
import {
  WebView,
  View,
  Text,
  InteractionManager,
  Platform,
} from 'react-native'
import {connect} from 'react-redux'
import {Emitter} from '../../events/Emitter'
import {updateWebState} from '../../reducers/tabinfo'
import {createTab, updateTab, removeTab, showTabPage} from '../../reducers/tabinfo'
import {printObj} from '../../utils/Common'
import WebViewAndroid from './WebViewAndroid'

var DefaultWebView = Platform.OS === 'ios' ? WebView : WebViewAndroid

var TEXT_INPUT_REF = 'urlInput';
var WEBVIEW_REF = 'webview';
var DEFAULT_URL = 'https://m.baidu.com/?from=1013843a&pu=sz%401321_480&wpo=btmfast';

type State = {
  url: string,
}

class Web extends Component {
  static PropTypes = {
    id: PropTypes.number.isRequired,
    url: PropTypes.string,
    navigator: PropTypes.func.isRequired,
  }

  state: State = {
    url: this.props.url
  }

  title: string = '';
  closeTab = false;
  navState: Object = {}

  constructor(props: any) {
    super(props)
    this.state = {
      url: this.props.url
    }
    this.initEvent();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.url != this.state.url) {
      return true;
    }
    if (nextProps.frontTabId != this.props.frontTabId) {
      return false
    }
    return false
  }

  componentWillUnmount() {
    console.log('$$$$$$$$$ Web componentWillUnmount');
    if (!this.closeTab) {
      let navState = {
        url: '',
        title: '主页'
      }
      this.props.updateWebState(this.props.id, navState);
      this.props.updateTab(this.props.id, navState);
      this.props.showTabPage(true);
    }
    this.unRegisterEvents();
  }

  render() {
    return (
      <DefaultWebView
        source={{uri: this.state.url}}
        ref={WEBVIEW_REF}
        automaticallyAdjustContentInsets={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        decelerationRate="normal"
        onNavigationStateChange={this.onNavigationStateChange}
        onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
        startInLoadingState={true}
        scalesPageToFit={true}
      />
    );
  }

  initEvent() {
    Emitter.addListener('url_changed', this.onUrlChanged);
    Emitter.addListener('web_back', this.onWebBack);
    Emitter.addListener('web_forward', this.onWebForward);
    Emitter.addListener('switch_tab', this.onSwitchTab);
    Emitter.addListener('close_tab', this.onCloseTab);
  }

  unRegisterEvents() {
    Emitter.removeListener('url_changed', this.onUrlChanged);
    Emitter.removeListener('web_back', this.onWebBack);
    Emitter.removeListener('web_forward', this.onWebForward);
    Emitter.removeListener('switch_tab', this.onSwitchTab);
    Emitter.removeListener('close_tab', this.onCloseTab);
  }

  back = () => {
    this.refs[WEBVIEW_REF].goBack();
  };

  forward = () => {
    this.refs[WEBVIEW_REF].goForward();
  };

  reload = () => {
    this.refs[WEBVIEW_REF].reload();
  };

  onUrlChanged = (...args) => {
    var tabId = args[0];
    if (tabId === this.props.id) {
      var url = args[1];
      this.setState({
        url: url
      })
    }
  }

  onWebForward = (...args) => {
    var tabId = args[0];
    if (tabId === this.props.id) {
      this.forward()
    }
  }

  onWebBack = (...args) => {
    var tabId = args[0];
    if (tabId === this.props.id) {
      if (this.navState.canGoBack) {
        console.log('canGoBack');
        this.back()
      } else {
        this.props.navigator.pop();
      }
    }
  }

  onSwitchTab = (...args) => {
    console.log('switch_tab: current: ' + this.props.id + ', switchTo: ' + args[0]);
    var id = args[0];
    if (this.props.id === id) {
      this.props.updateWebState(this.props.id, this.navState);
    }
  }

  onCloseTab = (...args) => {
    var id = args[0];
    if (this.props.id === id) {
      this.closeTab = true;
    }
  }

  onNavigationStateChange = (navState: any) => {
    console.log('$$$$$$$$$ onNavigationStateChange front: ' + this.props.frontTabId + ', id: ' + this.props.id);
    this.navState = navState;
    if (this.props.id === this.props.frontTabId) {
      this.props.updateWebState(this.props.id, navState);
    }
    this.props.updateTab(this.props.id, navState);
  };

  onShouldStartLoadWithRequest = (ev: any) => {
    return true;
  };
}

function mapStateToProps(state) {
  return {
    frontTabId: state.tabinfo.tabId,
    back: state.tabinfo.back,
    forward: state.tabinfo.forward
  }
}

function mapDispatchToProps(dispatch) {
  return {
    updateWebState: (id: number, navState: any) => {
      dispatch(updateWebState(id,
                            true, // navState.canGoBack,
                            navState.canGoForward,
                            navState.url,
                            simplifyTitle(navState.title)));
    },
    createTab: (id: number) => {
      dispatch(createTab(id))
    },
    updateTab: (id: number, navState: any) => {
      dispatch(updateTab(id,
                         navState.url,
                         simplifyTitle(navState.title)))
    },
    removeTab: (id: number) => {
      dispatch(removeTab(id))
    },
    showTabPage: (visible: bool) => {
      dispatch(showTabPage(visible))
    }
  }
}

function simplifyTitle(oldTitle: string) {
  var title = oldTitle;
  if (!title || title === '') {
    title = '加载中...'
  }
  return (title.length > 10
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

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps)(Web)
