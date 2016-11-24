/* @flow */

import React, { Component, PropTypes } from 'react'

import {
  Image,
  View,
  Text,
  StyleSheet,
  TextInput,
  Navigator,
  TouchableOpacity,
} from 'react-native'

import TouchableButton from '../components/TouchableButton'
import {Emitter} from '../events/Emitter'
import Transition from '../animation/NoTransition'

const style = StyleSheet.create({
  titlebar: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: '#fff',
    alignItems: 'center'
  }
})

export default class extends Component {
  state = {
    url: ''
  }

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={style.titlebar}>
        <TouchableOpacity onPress={() => this._cancel()}>
          <Text style={{
            paddingLeft: 12,
            color: 'black',
            fontSize: 14}}>
            取消
          </Text>
        </TouchableOpacity>
        <TextInput
          style={{
            flex: 1,
            paddingLeft: 8,
            backgroundColor: 'transparent',
            color: 'black',
            fontSize: 16}}
          autoFocus={true}
          autoCorrect={false}
          keyboardType='web-search'
          placeholder="请输入网址"
          underlineColorAndroid='transparent'
          onChangeText={(url) => this.setState({url})}
        />
        <View style={{paddingRight: 12}}>
          <TouchableButton
            pressFn = {() => this._search()}
            normalBg = 'icon_search_normal'
            pressBg = 'icon_search_pressed' />
        </View>
      </View>
    )
  }

  _cancel() {
    Emitter.emit('search_cancel', true);
  }

  _search() {
    var url: string = this.state.url;
    if (!url.startsWith("https://")
          && !url.startsWith("http://")) {
      alert('网址需以http://或者https://开头')
      return;
    }
    Emitter.emit('url_changed', this.state.url)
  }
}
