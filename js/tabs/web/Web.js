/*
 * refer to https://facebook.github.io/react-native/docs/webview.html
 * @flow */

import React, {PropTypes, Component } from 'react'
import {
  WebView,
  View,
  Text,
  InteractionManager,
} from 'react-native'
import {connect} from 'react-redux'
import {Emitter} from '../../events/Emitter'
import {updateWebState} from '../../reducers/tabinfo'
import {createTab, updateTab, removeTab, showTabPage} from '../../reducers/tabinfo'
import {printObj} from '../../utils/Common'


var TEXT_INPUT_REF = 'urlInput';
var WEBVIEW_REF = 'webview';
var DEFAULT_URL = 'https://m.baidu.com/?from=1013843a&pu=sz%401321_480&wpo=btmfast';

type State = {
  url: string,
  title: string,
  loading: bool,
  canBack: bool,
  canForward: bool,
  realGoBack: bool,
  scalesPageToFit: bool,
}

class Web extends Component {
  static PropTypes = {
    id: PropTypes.number.isRequired,
    url: PropTypes.string,
    navigator: PropTypes.func.isRequired,
  }

  firstLoad = false;

  state: State;

  closeTab = false;

  constructor(props: any) {
    super(props)

    this.state = {
      url: this.props.url || DEFAULT_URL,
      title: 'No Page Loaded',
      loading: true,
      canBack: true, // 返回键始终有效, 如果当前网页不可后退, 则返回至首页
      canForward: false,
      realGoBack: false,
      scalesPageToFit: true,
    };

    this.closeTab = false;
    this.initEvent();
    InteractionManager.runAfterInteractions(() => {
      this.setState({
          url: this.props.url
        }
      )
    })
  }

  componentWillUnmount() {
    console.log('$$$$$$$$$ Web componentWillUnmount');
    if (!this.closeTab) {
      this.props.updateWebState(this.props.id, {
                            url: '',
                            title: ''
                          });
      this.props.updateTab(this.props.id, {
                            url: '',
                            title: '主页'
                          });
      this.props.showTabPage(true);
    }
    this.unRegisterEvents();
  }

  render() {
    let isFirstLoad = this.firstLoad;
    if (isFirstLoad) {
      this.firstLoad = false;
    }
    return (
      isFirstLoad
      ? <View/>
      :
      <WebView
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
      if (this.state.realGoBack) {
        console.log('this.state.realGoBack');
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
      this.props.updateWebState(this.props.id, this.state);
    }
  }

  onCloseTab = (...args) => {
    var id = args[0];
    if (this.props.id === id) {
      this.closeTab = true;
    }
  }

  onNavigationStateChange = (navState: any) => {
    this.setState({
      url: navState.url,
      title: navState.title,
      loading: navState.loading,
      canBack: true, // 返回键始终有效, 如果当前网页不可后退, 则返回至首页
      canForward: navState.canGoForward,
      realGoBack: navState.canGoBack,
      scalesPageToFit: true
    });
    this.props.updateWebState(this.props.id, navState);
    this.props.updateTab(this.props.id, navState);
  };

  onShouldStartLoadWithRequest = (ev: any) => {
    return true;
  };
}

function mapStateToProps(state) {
  return {
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
