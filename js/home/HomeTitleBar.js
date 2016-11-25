/* @flow */

import React, { Component, PropTypes } from 'react'

import {
  Image,
  View,
  Text,
  StyleSheet,
  TextInput,
  Navigator,
  TouchableOpacity
} from 'react-native'

import TouchableButton from '../components/TouchableButton'
import Search from '../search/SearchScene'
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
        <View style={{paddingLeft: 12}}>
          <Image style={{
              paddingLeft: 12,
              width: 28,
              height: 28
            }}
            source={{uri: 'react_logo'}}/>
        </View>
        <View style={{
          flex: 1
        }}>
          <TouchableOpacity onPress={() => this._search()}>
            <Text style={{
              paddingLeft: 8,
              color: '#333',
              fontSize: 16}}>
              请输入网址
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{paddingRight: 12}}>
          <TouchableButton
            pressFn = {() => this._search()}
            normalBg = 'icon_search_normal'
            pressBg = 'icon_search_pressed' />
        </View>
      </View>
    )
  }

  _search() {
    if (this.props.navigator) {
      this.props.navigator.push({
        component: Search,
        scene: Transition.NONE
      })
    } else {
      var url: string = this.state.url;
      if (!url.startsWith("https://")
            && !url.startsWith("http://")) {
        alert('网址需以http://或者https://开头')
        return;
      }
      Emitter.emit('url_changed', this.state.url)
    }
  }
}
