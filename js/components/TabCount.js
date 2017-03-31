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

import * as IMG from '../assets/imageAssets'
import * as Consts from '../utils/Consts'

type Props = {
  tabCount: number,
  pressFn: Function,
}

class TabCount extends Component {
  static propTypes: Props

  shouldComponentUpdate(nextProps: Props, nextState: any) {
    if (nextProps.tabCount !== this.props.tabCount) {
      return true;
    }
    return false;
  }

  render() {
    return (
      <TouchableOpacity
        onPress={this.props.pressFn}
        onLongPress={this.props.longPressFn}>
        <View style={{
          width: 40,
          height: 40,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white'
        }}>
          <Image
            style={{
              width: 20,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            source={IMG.ICON_BOTTOM_TABS}>
            <Text style={{color: 'black', fontSize: Consts.spFont(11)}}>
              {this.props.tabCount}
            </Text>
          </Image>
        </View>
      </TouchableOpacity>
    )
  }
}

function mapStateToProps(state) {
  return {
    tabCount: state.tabinfo.tabIds.length || 1,
  }
}

module.exports = connect(mapStateToProps, null)(TabCount)
