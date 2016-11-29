/*
 * refer to https://facebook.github.io/react-native/docs/webview.html
 * @flow */

import React, {PropTypes, Component } from 'react';
import { WebView } from 'react-native';
import {connect} from 'react-redux'
import {Emitter} from '../events/Emitter'
import {progWebState} from '../reducers/webnavigator'
import {printObj} from '../utils/Common'


var TEXT_INPUT_REF = 'urlInput';
var WEBVIEW_REF = 'webview';
var DEFAULT_URL = 'https://m.baidu.com/?from=1013843a&pu=sz%401321_480&wpo=btmfast';

class Web extends Component {
  state = {
    url: DEFAULT_URL,
    title: 'No Page Loaded',
    loading: true,
    scalesPageToFit: true,
  };

  _preNavState = null;

  constructor(props: any) {
    super(props)
    Emitter.addListener('url_changed', (...args) => {
      var url: string = args[0];
      this.setState({
        url: url
      })
    });

    Emitter.addListener('web_back', () => {
      this._back()
    })

    Emitter.addListener('web_forward', () => {
      this._forward()
    })
  }

  render() {
    console.log('url: ' + this.state.url);
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
      title: navState.title,
      loading: navState.loading,
      scalesPageToFit: true
    });
    this._dispatchNavState(navState);
  };

  onShouldStartLoadWithRequest = (ev: any) => {
    return true;
  };

  _dispatchNavState(navState: any) {
    this.props.propWebState(navState)
  }
}

function mapStateToProps(state) {
  return {
    back: state.webnavigator.back,
    forward: state.webnavigator.forward
  }
}

function mapDispatchToProps(dispatch) {
  return {
    propWebState: (navState: any) => {
      dispatch(progWebState(navState.canGoBack,
                            navState.canGoForward,
                            navState.url,
                            navState.title));
      }
  }
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps)(Web)
