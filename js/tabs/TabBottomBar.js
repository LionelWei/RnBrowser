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
import EventEmitter from 'EventEmitter'

import TouchableButton from '../components/TouchableButton'
import BottomMenuPopup from '../bottompopup/BottomMenuPopup'
import TabIndicatorPopup from '../tabs/tabindicator/TabIndicatorPopup'
import {BOTTOM_BAR_HEIGHT} from '../utils/Consts'
import {Emitter} from '../events/Emitter'
import * as IMG from '../assets/imageAssets'

const style = StyleSheet.create({
  bottombar: {
    height: BOTTOM_BAR_HEIGHT,
    paddingLeft: 40,
    paddingRight: 40,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
})

class BottomBar extends Component {
  static propTypes = {
    navigator: PropTypes.object,
  };

  state = {
    showMenu: false,
    showTabIndicator: false
  }

  constructor() {
    super()
  }

  render() {
    const {navigator} = this.props
    return (
      <View>
        <View style={style.bottombar}>
          <TouchableButton
            pressFn={this.toggleMenu}
            normalBg = {IMG.ICON_MENU_NORMAL}
            pressBg = {IMG.ICON_MENU_PRESSED} />
          <TouchableButton
            pressFn = {this.toggleTabIndicator}
            normalBg = {IMG.ICON_NEW_ADD_NORMAL}
            pressBg = {IMG.ICON_NEW_ADD_PRESSED} />
        </View>
        <BottomMenuPopup isVisible={this.state.showMenu}/>
        <TabIndicatorPopup isVisible={this.state.showTabIndicator}/>
      </View>
    )
  }

  toggleMenu = () => {
    this.setState({
      showMenu: true,
      showTabIndicator: false
    })
  }

  toggleTabIndicator = () => {
    this.setState({
      showMenu: false,
      showTabIndicator: true
    })
  }

}

module.exports = connect(null, null)(BottomBar)
