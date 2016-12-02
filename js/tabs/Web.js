/*
 * refer to https://facebook.github.io/react-native/docs/webview.html
 * @flow */

import React, {PropTypes, Component } from 'react'
import {
  WebView,
  Modal
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
    id: PropTypes.number.isRequired
  }

  state = {
    navState: {
      url: DEFAULT_URL,
      title: 'No Page Loaded',
      loading: true,
      canBack: false,
      canForward: false,
      scalesPageToFit: true,
    }
  };

  constructor(props: any) {
    super(props)
    this.initEvent();
    this.props.createTab(this.props.id);
  }

  componentWillUnmount() {
    console.log('$$$$$$$$$ Id: ' + this.props.id + ' componentWillUnmount');
    this.props.removeTab(this.props.id);
  }

  render() {
    return (
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
        scalesPageToFit={this.state.navState.scalesPageToFit}
      />
    );
  }

  _initEvent() {
    Emitter.addListener('url_changed', (...args) => {
      var url: string = args[0];
      this.setState({
        navState: {
          url: url
        }
      })
    });

    Emitter.addListener('web_back', (...args) => {
      var tabId = args[0];
      if (tabId === this.props.id) {
        this.back()
      }
    })

    Emitter.addListener('web_forward', (...args) => {
      var tabId = args[0];
      if (tabId === this.props.id) {
        this.forward()
      }
    })

    Emitter.addListener('switch_tab', (...args) => {
      console.log('switch_tab: current: ' + this.props.id + ', switchTo: ' + args[0]);
      var id = args[0];
      if (this.props.id === id) {
        this.props.propWebState(this.props.id, this.state.navState);
      }
    })
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
