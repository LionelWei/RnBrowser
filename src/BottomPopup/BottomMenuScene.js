/* @flow */

import React, { Component, PropTypes } from 'react'

import {
  Image,
  View,
  Text,
  StyleSheet,
  Navigator,
  TextInput,
  Animated,
  Dimensions,
  TouchableOpacity
} from 'react-native'

import BottomPopupMenu from './BottomPopupMenu'

var {
  height: deviceHeight
} = Dimensions.get('window');

// navigator
export default class extends Component {
  static propTypes = {
    navigator: PropTypes.object
  };

  // <View style={styles.modal}>
  //   <BottomPopupMenu />
  // </View>

  render() {
    return (
      <Navigator
        initialRoute={{
          title: 'Awesome Scene', index: 0
        }}
        renderScene={(route, navigator) =>
          <Text>Hello {route.title}!</Text>
        }
        style={{
          padding: 100,
          backgroundColor: 'transparent'
        }}
      />
    )
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    opacity: 0.2,
    backgroundColor: 'transparent'
  },
  flexCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal: {
    backgroundColor: 'rgba(0,0,0,.8)',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  }
});
