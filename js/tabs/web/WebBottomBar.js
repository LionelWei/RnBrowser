/* @flow */

import React, { Component, PropTypes} from 'react'

import {
  Image,
  View,
  Text,
  StyleSheet,
  Navigator,
  TouchableHighlight,
  TouchableOpacity,
  Platform
} from 'react-native'

import {connect} from 'react-redux'
import TouchableButton from '../../components/TouchableButton'
import TabCount from '../../components/TabCount'
import {BOTTOM_BAR_HEIGHT} from '../../utils/Consts'
import {Emitter} from '../../events/Emitter'
import * as IMG from '../../assets/imageAssets'

const styles = StyleSheet.create({
  bottombar: {
    height: BOTTOM_BAR_HEIGHT,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white'
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
})

class WebBottomBar extends Component {
  static propTypes = {
    navigator: PropTypes.object,
    tabPressFn: PropTypes.func,
    menuPressFn: PropTypes.func,
    homePressFn: PropTypes.func,
    onBack: PropTypes.func,
    onForward: PropTypes.func,
  };

  tabCount = 1
  canGoForward = false
  canGoBack = true

  updateBottom(tabCount, navState) {
    if (tabCount !== this.tabCount
      || navState.canGoForward !== this.canGoForward) {
      this.tabCount = tabCount;
      this.canGoForward = navState.canGoForward;
      this.forceUpdate()
    }
  }

  render() {
    return (
      <View style={[styles.bottombar, styles.shadow]}>
        <TouchableButton
          enabled = {this.canGoBack}
          pressFn = {this.back}
          normalBg = {IMG.ICON_BACK_NORMAL} />

        <TouchableButton
          enabled = {this.canGoForward}
          pressFn = {this.forward}
          normalBg = {IMG.ICON_FORWARD_NORMAL} />

        <TouchableButton
          pressFn={this.props.menuPressFn}
          normalBg = {IMG.ICON_MENU_NORMAL} />

        <TabCount
          pressFn={this.props.tabPressFn}
          tabCount={this.tabCount}
        />

        <TouchableButton
          pressFn = {this.props.homePressFn}
          normalBg = {IMG.ICON_HOME_NORMAL} />
      </View>
    )
  }

  back = () => {
    this.props.onBack && this.props.onBack()
  }

  forward = () => {
    this.props.onForward && this.props.onForward();
  }
}

module.exports = WebBottomBar
