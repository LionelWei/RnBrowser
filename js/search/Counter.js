/* @flow */

import React, { Component, PropTypes } from 'react'

import {connect} from 'react-redux'

import {
  Image,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from 'react-native'

import {increase} from '../reducers/counter'


class Counter extends Component {

  static propTypes = {
    value: PropTypes.number,
    increase: PropTypes.func,
  }

  render() {
    const { value } = this.props
    return (
      <TouchableOpacity style={{flex: 1}}
        onPress={() => this.onIncreaseClick()}>
      <Text>{value}</Text>
      </TouchableOpacity>
    )
  }

  onIncreaseClick() {
    this.props.increase()
  }

}

function mapStateToProps(state) {
  return {
    value: state.counter.value
  }
}

function mapDispatchToProps(dispatch) {
  return {
    increase: () => dispatch(increase())
  }
}

// Action Creator
const increaseAction = { type: 'increase' }

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps)(Counter)
