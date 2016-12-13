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
  StyleSheet,
  Animated,
  TouchableWithoutFeedback
} from 'react-native';
import {NAV_BAR_HEIGHT ,BOTTOM_BAR_HEIGHT} from '../../utils/Consts'

import {createTab, removeTab, showTabPage} from '../../reducers/tabinfo'

import {connect} from 'react-redux'
import {Emitter} from '../../events/Emitter'
import WebPage from '../web/WebPage'
import TabBottomBar from './TabBottomBar'
import Search from '../../search/SearchScene'
import Transition from '../../animation/NoTransition'
import {LeftToRight} from '../../animation/NavigatorAnimation'
import BottomMenuPopup from '../../bottompopup/BottomMenuPopup'
import TabIndicatorPopup from '../manage/TabIndicatorPopup'
import ZoomablePage from '../../components/ZoomablePage'
import * as SITES from './CommonWebSites'
import * as IMG from '../../assets/imageAssets'


var {height, width} = Dimensions.get('window');

class TabPage extends ZoomablePage {
  constructor(props: any) {
    super(props);
    this.initEvent();
    this.props.createTab(this.props.id);
  }

  componentWillUnmount() {
    this.props.removeTab(this.props.id);
    this.unRegisterEvents();
  }

  onRender: Function = () => {
    return (
      <View style={{
        backgroundColor: 'white',
        flex: 1,
        flexDirection: 'column',
      }}>
        {this.renderIcons()}
      </View>
    )
  }

  renderLogo() {
    return (
      <View style={{
        marginTop: -100,
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
      <View>
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
      </View>
    )
  }

  renderIcons() {
    return (
      <View style={{
        marginTop: 30,
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

        <TouchableOpacity onPress={() => this.gotoWeb(SITES.QQ)}>
          <Image style={styles.web_icon} source={IMG.WEB_ICON_QQ}/>
        </TouchableOpacity>
      </View>
    )
  }

  initEvent() {
    Emitter.addListener('url_changed', this.onUrlChanged);
  }

  unRegisterEvents() {
    Emitter.removeListener('url_changed', this.onUrlChanged);
  }

  onUrlChanged = (...args) => {
    var tabId = args[0];
    if (tabId === this.props.id) {
      var routeStack = this.props.navigator.getCurrentRoutes();
      if (routeStack.length === 2) {
        var url = args[1];
        setTimeout(() => this.gotoWeb(url), 100);
      }
    }
  }

  gotoWeb = (url: string) => {
    this.props.navigator.push({
      component: WebPage,
      scene: LeftToRight,
      id: this.props.id,
      url: url
    })
    this.props.showTabPage(false);
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
  body: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  web_icon: {
    height: 40,
    width: 40,
  }
})

function mapStateToProps(state) {
  return {
    isTabManagerVisible: state.tabmanage.showManager,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    createTab: (id: number) => {
      dispatch(createTab(id))
    },
    removeTab: (id: number) => {
      dispatch(removeTab(id))
    },
    showTabPage: (visible) => {
      dispatch(showTabPage(visible))
    }
  }
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps)(TabPage)
