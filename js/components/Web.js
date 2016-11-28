/*
 * refer to https://facebook.github.io/react-native/docs/webview.html
 * @flow */

import React, {PropTypes, Component } from 'react';
import { WebView } from 'react-native';
import {connect} from 'react-redux'
import {Emitter} from '../events/Emitter'
import {canBack, canForward} from '../reducers/webnavigator'


var TEXT_INPUT_REF = 'urlInput';
var WEBVIEW_REF = 'webview';
var DEFAULT_URL = 'https://www.baidu.com';

class Web extends Component {
  state = {
    url: DEFAULT_URL,
    status: 'No Page Loaded',
    loading: true,
    scalesPageToFit: true,
  };

  constructor(props: any) {
    super(props)
    Emitter.addListener('url_changed', (...args) => {
      var url: string = args[0];
      this.setState({
        url: url
      })
    });
  }

  componentWillReceiveProps(nextProps: any) {
    if (nextProps.back) {
      this._back()
    } else if (nextProps.forward) {
      this._forward()
    }
  }

  render() {
    return (
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
        scalesPageToFit={this.state.scalesPageToFit}
      />
    );
  }

  _back = () => {
    this.refs[WEBVIEW_REF].goBack();
  };

  _forward = () => {
    this.refs[WEBVIEW_REF].goForward();
  };

  _reload = () => {
    this.refs[WEBVIEW_REF].reload();
  };

  onNavigationStateChange = (navState: any) => {
    this.setState({
      url: navState.url,
      status: navState.title,
      loading: navState.loading,
      scalesPageToFit: true
    });
    if (navState.canGoBack) {
      this.props.canBack();
    }
    if (navState.canGoForward) {
      this.props.canForward()
    }
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
    canBack: () => dispatch(canBack()),  // 测试
    canForward: () => dispatch(canForward())   // 测试
  }
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps)(Web)
