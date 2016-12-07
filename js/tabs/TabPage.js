/*
 * @flow */

import React, {PropTypes, Component } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  Navigator,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import {NAV_BAR_HEIGHT ,BOTTOM_BAR_HEIGHT} from '../utils/Consts'

import {createTab, removeTab} from '../reducers/webtabs'
import {connect} from 'react-redux'
import {Emitter} from '../events/Emitter'
import WebPage from './WebPage'
import TabBottomBar from './TabBottomBar'
import Search from '../search/SearchScene'
import Transition from '../animation/NoTransition'
import * as SITES from './CommonWebSites'
import * as IMG from '../assets/imageAssets'

var {height, width} = Dimensions.get('window');

class TabPage extends Component {
  constructor(props: any) {
    super(props)
    this.props.createTab(this.props.id);
  }

  componentWillUnmount() {
    this.props.removeTab(this.props.id);
  }

  render() {
    return (
      <View style={styles.container}>
        {this.renderBody()}
        {this.renderBottomBar()}
      </View>
    )
  }

  renderBody() {
    return (
      <View style={styles.body}>
        {this.renderLogo()}
        {this.renderSearchBar()}
        {this.renderIcons()}
      </View>
    )
  }

  renderBottomBar() {
    return (
      <TabBottomBar />
    )

  }

  renderLogo() {
    return (
      <View style={{
        marginTop: -40,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'}}>
        <Image style={{
            width: 40,
            height: 40}}
            resizeMode='stretch'
          source={IMG.ATOM_ICON}/>
        <Text style={{
          paddingLeft: 4,
          fontStyle: 'italic',
          color: 'dimgray',
          textShadowRadius: 5,
          textShadowOffset: {width: 2, height: 2},
          textShadowColor: 'darkgrey',
          fontSize: 30
        }}>Browser</Text>
      </View>
    )
  }

  renderSearchBar() {
    return (
      <Text
        style={{
          width: width - 20,
          height: 50,
          marginTop: 10,
          marginBottom: 10,
          marginLeft: 8,
          backgroundColor: 'transparent',
          borderRadius: 5,
          borderWidth: 1,
          opacity: 0.2,
          borderStyle: 'solid'}}
        onPress={this.search}
      />
    )
  }

  renderIcons() {
    return (
      <View style={{
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-around'
      }}>
        <TouchableOpacity onPress={() => this.gotoWeb(SITES.BAIDU)}>
          <Image style={styles.web_icon} source={IMG.WEB_ICON_BAIDU}/>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => this.gotoWeb(SITES.WEIBO)}>
          <Image style={styles.web_icon} source={IMG.WEB_ICON_WEIBO}/>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => this.gotoWeb(SITES.TAOBAO)}>
          <Image style={styles.web_icon} source={IMG.WEB_ICON_TAOBAO}/>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => this.gotoWeb(SITES.NETEASE)}>
          <Image style={styles.web_icon} source={IMG.WEB_ICON_NETEASE}/>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => this.gotoWeb(SITES.QQ)}>
          <Image style={styles.web_icon} source={IMG.WEB_ICON_QQ}/>
        </TouchableOpacity>
      </View>
    )
  }

  gotoWeb = (url: string) => {
    this.props.navigator.push({
      component: WebPage,
      scene: Navigator.SceneConfigs.PushFromRight,
      id: this.props.id,
      url: url
    })
  }

  search = () => {
    if (this.props.navigator) {
      this.props.navigator.push({
        component: Search,
        scene: Transition.NONE,
        defaultUrl: this.props.url,
        tabId: this.props.id,
        navigator: this.props.navigator
      })
    } else {
      alert('no navigator')
    }
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  body: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center'
  },
  web_icon: {
    height: 30,
    width: 30,
  }
})

function mapDispatchToProps(dispatch) {
  return {
    createTab: (id: number) => {
      dispatch(createTab(id))
    },
    removeTab: (id: number) => {
      dispatch(removeTab(id))
    }
  }
}

module.exports = connect(
  null,
  mapDispatchToProps)(TabPage)
