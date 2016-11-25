/* @flow */

import React, { Component, PropTypes } from 'react'

import {
  View,
  Text,
  StyleSheet
} from 'react-native'

import Web from '../components/Web'

const style = StyleSheet.create({
  content: {
    flex: 1
  }
})

export default class extends Component {
  static propTypes = {
    url: PropTypes.string.isRequired
  };

  render() {
    return (
      <Web url={this.props.url}/>
    )
  }
}
