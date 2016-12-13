/* @flow */

import React, { Component, PropTypes} from 'react'

import {
  Image,
  View,
  Text,
  StyleSheet,
  Navigator,
  TouchableWithoutFeedback,
  TouchableNativeFeedback,
  Modal,
  TouchableHighlight,
  Platform
} from 'react-native'

import {connect} from 'react-redux'
import TouchableButton from '../../components/TouchableButton'
import BottomMenuPopup from '../../bottompopup/BottomMenuPopup'
import TabIndicatorPopup from '../manage/TabIndicatorPopup'
import {BOTTOM_BAR_HEIGHT} from '../../utils/Consts'
import {Emitter} from '../../events/Emitter'
import * as IMG from '../../assets/imageAssets'


const style = StyleSheet.create({
  bottombar: {
    height: BOTTOM_BAR_HEIGHT,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white'
  }
})


const bg='bottombar_bg_with_shadow'

class WebBottomBar extends Component {
  static propTypes = {
    navigator: PropTypes.object,
    tabPressFn: PropTypes.func,
    menuPressFn: PropTypes.func,
    homePressFn: PropTypes.func,
  };

  render() {
    return (
      <View style={style.bottombar}>
        <TouchableButton
          enabled = {this.props.canBack}
          pressFn = {this.back}
          normalBg = {IMG.ICON_BACK_NORMAL}
          pressBg = {IMG.ICON_BACK_PRESSED} />

        <TouchableButton
          enabled = {this.props.canForward}
          pressFn = {this.forward}
          normalBg = {IMG.ICON_FORWARD_NORMAL}
          pressBg = {IMG.ICON_FORWARD_PRESSED} />

        <TouchableButton
          pressFn={this.props.menuPressFn}
          normalBg = {IMG.ICON_MENU_NORMAL}
          pressBg = {IMG.ICON_MENU_PRESSED} />

        <TouchableButton
          pressFn={this.props.tabPressFn}
          normalBg = {IMG.ICON_NEW_ADD_NORMAL}
          pressBg = {IMG.ICON_NEW_ADD_PRESSED} />

        <TouchableButton
          pressFn = {this.props.homePressFn}
          normalBg = {IMG.ICON_HOME_NORMAL}
          pressBg = {IMG.ICON_HOME_PRESSED} />
      </View>
    )
  }

  back = () => {
    Emitter.emit('web_back', this.props.tabId);
  }

  forward = () => {
    Emitter.emit('web_forward', this.props.tabId);
  }
}

function mapStateToProps(state) {
  return {
    tabId: state.tabinfo.tabId,
    canBack: state.tabinfo.canBack || false,
    canForward: state.tabinfo.canForward || false,
  }
}

module.exports = connect(mapStateToProps, null)(WebBottomBar)
