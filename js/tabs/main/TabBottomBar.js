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

import TouchableButton from '../../components/TouchableButton'
import {BOTTOM_BAR_HEIGHT} from '../../utils/Consts'
import {Emitter} from '../../events/Emitter'
import * as IMG from '../../assets/imageAssets'

const style = StyleSheet.create({
  bottombar: {
    height: BOTTOM_BAR_HEIGHT,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingLeft: 40,
    paddingRight: 40,
  }

})

class TabBottomBar extends Component {
  static propTypes = {
    navigator: PropTypes.object,
    menuPressFn: PropTypes.func.isRequired,
    tabPressFn: PropTypes.func.isRequired,
  };

  constructor() {
    super()
  }

  render() {
    const {navigator} = this.props
    return (
      <View>
        <View style={style.bottombar}>
          <View style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between'}}>
            <TouchableButton
              pressFn={() => this.props.menuPressFn()}
              normalBg = {IMG.ICON_MENU_NORMAL}
              pressBg = {IMG.ICON_MENU_PRESSED} />
            <TouchableButton
              pressFn = {() => this.props.tabPressFn()}
              normalBg = {IMG.ICON_NEW_ADD_NORMAL}
              pressBg = {IMG.ICON_NEW_ADD_PRESSED} />
          </View>
        </View>
      </View>
    )
  }
}

module.exports = connect(null, null)(TabBottomBar)
