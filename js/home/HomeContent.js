/* @flow */

import React, { Component, PropTypes } from 'react'

import {
  View,
  Text,
  StyleSheet
} from 'react-native'

import WebController from '../webview/WebController'

const style = StyleSheet.create({
  content: {
    flex: 1
  }
})

export default class extends Component {
  render() {
  return (
      <WebController />
    )
  }
}
