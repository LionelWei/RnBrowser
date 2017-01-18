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

import {NAV_BAR_HEIGHT ,BOTTOM_BAR_HEIGHT} from '../../utils/Consts'
import TouchableButton from '../../components/TouchableButton'
import Search from '../../search/SearchScene'
import {Emitter} from '../../events/Emitter'
import Transitions from '../../animation/NavigatorAnimation'
import * as IMG from '../../assets/imageAssets'

const TITLE_BAR_HEIGHT = NAV_BAR_HEIGHT - 2; // 减去进度条高度

class WebTitleBar extends Component {
  static defaultProps = {
    onStopLoading: PropTypes.func,
    onReload: PropTypes.func,
  }

  state = {
    url: '',
    title: '',
    loading: true,
    visible: true,
  }

  constructor(props: any) {
    super(props);
  }

  updateTitle = (navState) => {
    this.setState({
      url: navState.url,
      title: navState.title,
      loading: navState.loading,
    })
  }

  show = () => {
    this.setState({
      visible: true
    })
  }

  hide = () => {
    this.setState({
      visible: false
    })
  }

  getTitleText = () => {
    return this.state.title
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.url !== this.state.url
      || nextState.title !== this.state.title
      || nextState.loading !== this.state.loading
      || nextState.visible !== this.state.visible) {
      return true;
    }
    return false;
  }

  render() {
    console.log('==== WebTitleBar url: ' + this.state.url);
    return (
      this.state.visible
      ? <View style={[styles.titlebar]}>
          {this.renderSearchIcon()}
          {this.renderText()}
          {this.renderLoadingIcon()}
        </View>
      : null
    )
  }

  renderSearchIcon = () => {
    return  <View>
              <TouchableButton
                pressFn = {this.search}
                normalBg = {IMG.ICON_SEARCH_NORMAL}/>
            </View>
  }

  renderText = () => {
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
                    {this.state.title}
                </Text>
              </View>
            </TouchableOpacity>
            </View>
  }

  renderLoadingIcon = () => {
    let icon = this.state.loading
              ? IMG.ICON_WEB_STOP_LOADING
              : IMG.ICON_WEB_REFRESH;
    let pressFn = this.state.loading
              ? this.onStopLoading
              : this.onReload;
    return  <View>
              <TouchableButton
                pressFn = {pressFn}
                normalBg = {icon} />
            </View>
  }

  onStopLoading = () => {
    this.props.onStopLoading();
    this.setState({
      loading: false
    })
  }

  onReload = () => {
    this.props.onReload()
  }

  search = () => {
    if (this.props.navigator) {
      this.props.navigator.push({
        component: Search,
        scene: Transitions.NONE,
        defaultUrl: this.state.url,
        navigator: this.props.navigator,
        onUrlChanged: this.props.onUrlChanged,
      })
    } else {
      alert('no navigator')
    }
  }
}

const styles = StyleSheet.create({
  titlebar: {
    flexDirection: 'row',
    height: TITLE_BAR_HEIGHT,
    backgroundColor: 'white',
    alignItems: 'center'
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

module.exports = WebTitleBar
