/*
 * @flow */

import React, {PropTypes, Component } from 'react';
import {
  WebView,
  View,
  Text,
  Dimensions,
  StyleSheet
} from 'react-native';
import {NAV_BAR_HEIGHT ,BOTTOM_BAR_HEIGHT} from '../../utils/Consts'

import {connect} from 'react-redux'
import {Emitter} from '../../events/Emitter'
import Web from './Web'
import ZoomablePage from '../../components/ZoomablePage'

class WebPage extends ZoomablePage {
  menuPopup = {};
  tabIndicatorPopup = {};

  componentWillReceiveProps(nextProps) {
  }

  onRender: Function = () => {
    return (
      <Web
        id={this.props.id}
        url={this.props.url}
        navigator={this.props.navigator}/>
    )
  }
}

function mapStateToProps(state) {
  return {
    isTabManagerVisible: state.tabmanage.showManager,
  }
}

function mapDispatchToProps(dispatch) {
  return {
  }
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps)(WebPage)
