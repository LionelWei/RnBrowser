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

import TouchableButton from '../../components/TouchableButton'
import Search from '../../search/SearchScene'
import {Emitter} from '../../events/Emitter'
import Transition from '../../animation/NoTransition'
import * as IMG from '../../assets/imageAssets'

const style = StyleSheet.create({
  titlebar: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: '#f1f2f3',
    alignItems: 'center'
  }
})

class WebTitleBar extends Component {
  static defaultProps = {
    url: '',
    title: '请输入网址',
  }

  constructor(props: any) {
    super(props);
  }

  render() {
    console.log('==== WebTitleBar url: ' + this.props.url);
    return (
      <View style={style.titlebar}>
        <View style={{paddingLeft: 12}}>
          <Image style={{
              paddingLeft: 12,
              width: 28,
              height: 28
            }}
            source={IMG.REACT_LOGO}/>
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
          onFocus={()=>this.search()}
          underlineColorAndroid='transparent'/>
        </View>
        <View style={{
          paddingLeft: 12,
          paddingRight: 12}}>
          <TouchableButton
            pressFn = {this.search}
            normalBg = {IMG.ICON_SEARCH_NORMAL}
            pressBg = {IMG.ICON_SEARCH_PRESSED} />
        </View>
      </View>
    )
  }

  search = () => {
    if (this.props.navigator) {
      this.props.navigator.push({
        component: Search,
        scene: Transition.NONE,
        defaultUrl: this.props.url,
        navigator: this.props.navigator
      })
    } else {
      alert('no navigator')
    }
  }
}

function mapStateToProps(state) {
  return {
    url: state.tabinfo.url,
    title: state.tabinfo.title
  }
}

module.exports = connect(mapStateToProps, null)(WebTitleBar)
