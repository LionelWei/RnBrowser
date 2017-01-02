// @flow

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

import {NAV_BAR_HEIGHT ,BOTTOM_BAR_HEIGHT} from '../../utils/Consts'
import TouchableButton from '../../components/TouchableButton'
import Search from '../../search/SearchScene'
import {Emitter} from '../../events/Emitter'
import Transitions from '../../animation/NavigatorAnimation'
import * as IMG from '../../assets/imageAssets'

const style = StyleSheet.create({
  titlebar: {
    flexDirection: 'row',
    height: NAV_BAR_HEIGHT,
    backgroundColor: 'white',
    alignItems: 'center'
  }
})

class TabTitleBar extends Component {
  static propTypes = {
    url: PropTypes.string,
    title: PropTypes.string,
    onUrlChanged: PropTypes.func.isRequired,
  }

  title = ''

  constructor(props: any) {
    super(props);
  }

  getTitleText = () => {
    return this.title
  }

  componentWillMount() {
    this.title = this.props.title || '主页'
  }

  render() {
    return (
      <View style={style.titlebar}>
        {this.renderButton()}
        {this.renderText()}
      </View>
    )
  }

  renderText = () => {
    let title = this.title
    return <View style={{
              flex: 1
            }}>
            <TouchableOpacity
              style={{
                flex: 1,}}
              onPress={()=>this.search()}>
              <View style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Text
                  style={{
                    color: 'black',
                    fontSize: 16}}
                  numberOfLines={1}>
                    {title}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
  }

  renderButton = () => {
    return  <View>
              <TouchableButton
                pressFn = {this.search}
                normalBg = {IMG.ICON_SEARCH_NORMAL}
                pressBg = {IMG.ICON_SEARCH_PRESSED} />
            </View>
  }

  search = () => {
    if (this.props.navigator) {
      this.props.navigator.push({
        component: Search,
        scene: Transitions.NONE,
        defaultUrl: this.props.url || '',
        navigator: this.props.navigator,
        onUrlChanged: this.props.onUrlChanged,
      })
    } else {
      alert('no navigator')
    }
  }
}

module.exports = TabTitleBar
