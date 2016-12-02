/* @flow */

import React, { Component, PropTypes } from 'react'

import {
  View,
  Text,
  StyleSheet
} from 'react-native'

import TabController from '../tabs/TabController'

const style = StyleSheet.create({
  content: {
    flex: 1
  }
})

export default class extends Component {
  render() {
  return (
      <TabController />
    )
  }
}
