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

import {connect} from 'react-redux'
import {append} from '../reducers/searchhistory'

import {NAV_BAR_HEIGHT} from '../utils/Consts'
import TouchableButton from '../components/TouchableButton'
import {Emitter} from '../events/Emitter'
import * as IMG from '../assets/imageAssets'

const style = StyleSheet.create({
  titlebar: {
    flexDirection: 'row',
    height: NAV_BAR_HEIGHT,
    backgroundColor: '#fff',
    alignItems: 'center'
  }
})
const TEXT_INPUT_REF = 'urlInput';

class SearchTitleBar extends Component {

  static propTypes = {
    defaultUrl: PropTypes.string,
    append: PropTypes.func,
  }

  inputText = '';

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={style.titlebar}>
        <TouchableOpacity onPress={this.cancel}>
          <Text style={{
            paddingLeft: 12,
            color: 'black',
            fontSize: 14}}>
            取消
          </Text>
        </TouchableOpacity>
        <TextInput
          ref={TEXT_INPUT_REF}
          style={{
            flex: 1,
            paddingLeft: 8,
            backgroundColor: 'transparent',
            color: 'black',
            fontSize: 16}}
          autoCapitalize="none"
          autoFocus={true}
          autoCorrect={false}
          defaultValue={this.props.defaultUrl}
          selectTextOnFocus={true}
          placeholder="请输入网址"
          underlineColorAndroid='transparent'
          returnKeyType='search'
          onSubmitEditing={this.search}
          onChangeText={this.handleTextInputChange}
        />
        <View style={{
          paddingLeft: 12,}}>
          <TouchableButton
            pressFn = {this.search}
            normalBg = {IMG.ICON_SEARCH_NORMAL}
            pressBg = {IMG.ICON_SEARCH_PRESSED} />
        </View>
      </View>
    )
  }

  cancel = () => {
    this.popNavi();
  }

  search = () => {
    let url: string = this.inputText;
    if (!url.startsWith("https://")
          && !url.startsWith("http://")) {
      alert('网址需以http://或者https://开头')
      return;
    }
    console.log('inputUrl: ' + this.inputText + ', frontTabId: ' + this.props.frontTabId);
    this.props.append(this.inputText)

    var routeStack = this.props.navigator.getCurrentRoutes();
    var prevRoute = routeStack[routeStack.length - 1];
    prevRoute.url = this.inputText;

    this.props.onUrlChanged(url)
    this.popNavi()
  }

  handleTextInputChange = (inputText) => {
    var url = inputText;
    if (!/^[a-zA-Z-_]+:/.test(url)) {
      url = 'http://' + url;
    }
    this.inputText = url;
  };

  popNavi = () => {
    this.props.navigator.pop()
  }
}

function mapStateToProps(state) {
  return {
    frontTabId: state.tabinfo.tabId,
  }
}
function mapDispatchToProps(dispatch) {
  return {
    append: (url) => dispatch(append(url)),
  }
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps)(SearchTitleBar)
