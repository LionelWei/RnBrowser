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

import * as IMG from '../assets/imageAssets'

type Props = {
  tabCount: number,
  pressFn: Function,
}

export default class TabCount extends Component {
  static propTypes: Props

  shouldComponentUpdate(nextProps: Props, nextState: any) {
    if (nextProps.tabCount !== this.props.tabCount) {
      return true;
    }
    return false;
  }

  render() {
    return (
      <TouchableOpacity onPress={this.props.pressFn}>
        <View style={{
          width: 50,
          height: 50,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Image
            style={{
              width: 20,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            source={IMG.ICON_BOTTOM_TABS}>
            <Text style={{color: 'black', fontSize: 11}}>
              {this.props.tabCount}
            </Text>
          </Image>
        </View>
      </TouchableOpacity>
    )
  }
}
