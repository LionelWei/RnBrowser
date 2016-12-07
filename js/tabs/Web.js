/*
 * refer to https://facebook.github.io/react-native/docs/webview.html
 * @flow */

import React, {PropTypes, Component } from 'react'
import {
  WebView,
  View,
  Text
} from 'react-native'
import {connect} from 'react-redux'
import {Emitter} from '../events/Emitter'
import {progWebState} from '../reducers/webnavigator'
import {createTab, updateTab, removeTab} from '../reducers/webtabs'
import {printObj} from '../utils/Common'


var TEXT_INPUT_REF = 'urlInput';
var WEBVIEW_REF = 'webview';
var DEFAULT_URL = 'https://m.baidu.com/?from=1013843a&pu=sz%401321_480&wpo=btmfast';

class Web extends Component {
  static PropTypes = {
    id: PropTypes.number.isRequired,
    url: PropTypes.string
  }

  state = {
    navState : {
      url: this.props.url || DEFAULT_URL,
      title: 'No Page Loaded',
      loading: true,
      canBack: false,
      canForward: false,
      scalesPageToFit: true,
    }
  };

  closeTab = false;

  constructor(props: any) {
    super(props)
    this.closeTab = false;
    this.initEvent();
  }

  componentWillUnmount() {
    console.log('$$$$$$$$$ Web componentWillUnmount');
    if (!this.closeTab) {
      this.props.updateTab(this.props.id, {
                            url: '',
                            title: '主页'
                          });
    }
    this.unRegisterEvents();
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <WebView
          source={{uri: this.state.navState.url}}
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
      </View>
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
        navState: {
          url: url
        }
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
      this.back()
    }
  }

  onSwitchTab = (...args) => {
    console.log('switch_tab: current: ' + this.props.id + ', switchTo: ' + args[0]);
    var id = args[0];
    if (this.props.id === id) {
      this.props.propWebState(this.props.id, this.state.navState);
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
      navState: {
        url: navState.url,
        title: navState.title,
        loading: navState.loading,
        canBack: navState.canGoBack,
        canForward: navState.canGoForward,
        scalesPageToFit: true
      }
    });

    this.props.propWebState(this.props.id, navState);
    this.props.updateTab(this.props.id, navState);
  };

  onShouldStartLoadWithRequest = (ev: any) => {
    return true;
  };
}

function mapStateToProps(state) {
  return {
    back: state.webnavigator.back,
    forward: state.webnavigator.forward
  }
}

function mapDispatchToProps(dispatch) {
  return {
    propWebState: (id: number, navState: any) => {
      dispatch(progWebState(id,
                            navState.canGoBack,
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
