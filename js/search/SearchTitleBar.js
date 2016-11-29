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
const TEXT_INPUT_REF = 'urlInput';

class SearchTitleBar extends Component {

  static propTypes = {
    defaultUrl: PropTypes.string,
    append: PropTypes.func
  }

  inputText = '';

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={style.titlebar}>
        <TouchableOpacity onPress={this._cancel}>
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
          defaultValue={this.props.defaultUrl}
          selectTextOnFocus={true}
          placeholder="请输入网址"
          underlineColorAndroid='transparent'
          onSubmitEditing={this._search}
          onChangeText={this._handleTextInputChange}
        />
        <View style={{paddingRight: 12}}>
          <TouchableButton
            pressFn = {this._search}
            normalBg = 'icon_search_normal'
            pressBg = 'icon_search_pressed' />
        </View>
      </View>
    )
  }

  _cancel = () => {
    Emitter.emit('search_cancel', true);
  }

  _search = () => {
    var url: string = this.inputText;
    if (!url.startsWith("https://")
          && !url.startsWith("http://")) {
      alert('网址需以http://或者https://开头')
      return;
    }
    this.props.append(this.inputText)
    console.log('inputUrl: ' + this.inputText);
    Emitter.emit('url_changed', this.inputText)
  }

  _handleTextInputChange = (inputText) => {
    var url = inputText;
    if (!/^[a-zA-Z-_]+:/.test(url)) {
      url = 'http://' + url;
    }
    this.inputText = url;
  };
}

function mapDispatchToProps(dispatch) {
  return {
    append: (url) => dispatch(append(url)),
  }
}

module.exports = connect(
  null,
  mapDispatchToProps)(SearchTitleBar)
