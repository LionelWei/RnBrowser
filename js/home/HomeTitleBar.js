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

import {connect} from 'react-redux'
import EventEmitter from 'EventEmitter'

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

class HomeTitleBar extends Component {
  static defaultProps = {
    url: '',
    title: '请输入网址'
  }

  constructor(props: any) {
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
        <TextInput
          style={{
            flex: 1,
            paddingLeft: 8,
            backgroundColor: 'transparent',
            color: 'black',
            fontSize: 16}}
          autoFocus={false}
          numberOfLines={1}
          defaultValue={this.props.title}
          placeholder="请输入网址"
          onFocus={()=>this._search()}
          underlineColorAndroid='transparent'/>
        </View>
        <View style={{
          paddingLeft: 12,
          paddingRight: 12}}>
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
        scene: Transition.NONE,
        defaultUrl: this.props.url
      })
    } else {
      alert('no navigator')
    }
  }
}

function mapStateToProps(state) {
  return {
    url: state.webnavigator.url,
    title: state.webnavigator.title
  }
}

module.exports = connect(mapStateToProps, null)(HomeTitleBar)
