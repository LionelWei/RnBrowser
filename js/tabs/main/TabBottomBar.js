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
      <View style={style.bottombar}>
        <TouchableButton
          pressFn={() => this.props.menuPressFn()}
          normalBg = {IMG.ICON_MENU_NORMAL}
          pressBg = {IMG.ICON_MENU_PRESSED} />
        <TabCount
          pressFn={() => this.props.tabPressFn()}
          tabCount={this.props.tabCount}
        />
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    tabCount: state.tabinfo.tabs.length,
  }
}

module.exports = connect(mapStateToProps, null)(TabBottomBar)
