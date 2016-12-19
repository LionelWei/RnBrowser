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
          <View style={{
            width: 22,
            height: 22,
            borderWidth: 2,
            borderColor: 'black',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Text style={{color: 'black'}}>
              {this.props.tabCount}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }
}
