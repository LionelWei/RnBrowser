// @flow

import React, { Component, PropTypes } from 'react'

import {
  Image,
  View,
  Text,
  StyleSheet,
  TextInput,
  Navigator,
  TouchableOpacity,
  PixelRatio
} from 'react-native'

import {connect} from 'react-redux'
import EventEmitter from 'EventEmitter'

import TouchableButton from '../../components/TouchableButton'
import {Emitter} from '../../events/Emitter'
import Transitions from '../../animation/NavigatorAnimation'
import * as IMG from '../../assets/imageAssets'
import * as Consts from '../../utils/Consts'

class TabTitleBar extends Component {
  static propTypes = {
    url: PropTypes.string,
    title: PropTypes.string,
  }

  title = ''

  constructor(props: any) {
    super(props);
  }

  getTitleText = () => {
    return this.title
  }

  componentWillMount() {
    // this.title = this.props.title || '主页'
    this.title = '';
  }

  render() {
    return (
      <View style={[styles.titlebar]}>
        {/*this.renderButton()*/}
        {this.renderText()}
      </View>
    )
  }

  renderText = () => {
    let title = this.title
    return <View style={{
              flex: 1,
            }}>
            <TouchableOpacity
              style={{
                flex: 1,}}
              onPress={this.props.onSearch}>
              <View style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Text
                  style={{
                    color: 'black',
                    fontSize: Consts.spFont(14)}}
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
                width={18}
                height={18}
                pressFn = {this.props.onSearch}
                normalBg = {IMG.ICON_SEARCH_NORMAL}/>
            </View>
  }
}

const styles = StyleSheet.create({
  titlebar: {
    flexDirection: 'row',
    height: Consts.SEARCH_BAR_HEIGHT,
    alignItems: 'center',
    marginLeft: 30,
    marginRight: 30,
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1 / PixelRatio.get(),
    borderColor: '#888888'
  },
  shadow: {
    elevation: 4,
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {
      height: 2,
    },
  },
})

module.exports = TabTitleBar
