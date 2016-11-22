/* @flow */

import React, { Component, PropTypes } from 'react'

import {
  Image,
  View,
  Text,
  StyleSheet,
  TextInput
} from 'react-native'

import TouchableButton from './TouchableButton'

const style = StyleSheet.create({
  titlebar: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: '#fff',
    alignItems: 'center'
  }
})

export default class extends Component {

  static propTypes = {
    search: PropTypes.func.isRequired
  };

  state = {
    url: ''
  };

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
            source={{uri: 'icon_uc_logo'}}/>
        </View>
        <TextInput
          style={{
            flex: 1,
            backgroundColor: 'transparent'}}
          autoCorrect={false}
          keyboardType='web-search'
          placeholder="Type here to translate!"
          underlineColorAndroid='transparent'
          onChangeText={(url) => this.setState({url})}
        />
        <View style={{paddingRight: 12}}>
          <TouchableButton
            pressFn = {()=>this.props.search(this.state.url)}
            normalBg = 'icon_search_normal'
            pressBg = 'icon_search_pressed' />
        </View>
      </View>
    )
  }
}
