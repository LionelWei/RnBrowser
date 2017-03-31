/* @flow */

import React, { Component, PropTypes} from 'react'

import {
  Image,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableNativeFeedback,
  Modal,
  TouchableHighlight,
  Platform
} from 'react-native'

import {connect} from 'react-redux'

import TouchableButton from '../../components/TouchableButton'
import TabCount from '../../components/TabCount'
import {BOTTOM_BAR_HEIGHT} from '../../utils/Consts'
import {Emitter} from '../../events/Emitter'
import * as IMG from '../../assets/imageAssets'

const style = StyleSheet.create({
  bottombar: {
    height: BOTTOM_BAR_HEIGHT,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 40,
    paddingRight: 40,
  }

})

class TabBottomBar extends Component {
  static propTypes = {
    menuPressFn: PropTypes.func.isRequired,
    tabPressFn: PropTypes.func.isRequired,
  };

  constructor() {
    super()
  }

  render() {
    return (
      <View style={style.bottombar}>
        <TouchableButton
          pressFn={() => this.props.menuPressFn(true)}
          normalBg = {IMG.ICON_MENU_NORMAL} />
        <TabCount
          pressFn={() => this.props.tabPressFn()}
        />
      </View>
    )
  }
}

module.exports = TabBottomBar;
