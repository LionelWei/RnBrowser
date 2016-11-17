/* @flow */

import React, { Component } from 'react'

import {
  View,
  Text,
  StyleSheet
} from 'react-native'

const style = StyleSheet.create({
  content: {
    flex: 1
  }
})

export default class extends Component {
  render() {
    return (
      <View style={style.content}>
        <Text>Content</Text>
      </View>
    )
  }
}
