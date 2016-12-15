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

import {createTab, removeTab, showTabPage, updateWebState} from '../../reducers/tabinfo'

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
import WebsiteIcon from './WebsiteIcon'
import * as SITES from './CommonWebSites'
import * as IMG from '../../assets/imageAssets'


var {height, width} = Dimensions.get('window');

class TabPage extends ZoomablePage {
  constructor(props: any) {
    super(props);
    this.initEvent();
    this.props.createTab(this.props.id);
    this.props.updateWebState(this.props.id)
  }

  componentWillUnmount() {
    this.props.removeTab(this.props.id);
    this.unRegisterEvents();
  }

  onRender: Function = () => {
    return (
      <View style={{
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
        flexWrap: 'wrap',
        justifyContent: 'flex-start'
      }}>
        <WebsiteIcon
          pressFn={() => {this.gotoWeb(SITES.BAIDU)}}
          icon={IMG.WEB_ICON_BAIDU}/>
        <WebsiteIcon
          pressFn={() => {this.gotoWeb(SITES.YOUKU)}}
          icon={IMG.YOUKU_ICON}/>
        <WebsiteIcon
          pressFn={() => {this.gotoWeb(SITES.EGAME)}}
          icon={IMG.EGAME_ICON}/>
        <WebsiteIcon
          pressFn={() => {this.gotoWeb(SITES.QQ)}}
          icon={IMG.WEB_ICON_QQ}/>
        <WebsiteIcon
          pressFn={() => {this.gotoWeb(SITES.TAOBAO)}}
          icon={IMG.WEB_ICON_TAOBAO}/>
      </View>
    )
  }

  initEvent() {
    Emitter.addListener('url_changed', this.onUrlChanged);
    Emitter.addListener('switch_tab', this.onSwitchTab);
  }

  unRegisterEvents() {
    Emitter.removeListener('url_changed', this.onUrlChanged);
    Emitter.addListener('switch_tab', this.onSwitchTab);
  }

  onUrlChanged = (...args) => {
    var tabId = args[0];
    if (tabId === this.props.id) {
      var routeStack = this.props.navigator.getCurrentRoutes();
      if (routeStack.length === 1) {
        var url = args[1];
        setTimeout(() => this.gotoWeb(url), 100);
      }
    }
  }

  onSwitchTab = (...args) => {
    var id = args[0];
    if (this.props.id === id) {
      var routeStack = this.props.navigator.getCurrentRoutes();
      if (routeStack.length === 1) {
        this.props.updateWebState(this.props.id);
      }
    }
  }

  gotoWeb = (url: string) => {
    console.log('=== gotoWeb url: ' + url);
    this.props.navigator.push({
      component: WebPage,
      scene: Transition.NONE,
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
})

function mapStateToProps(state) {
  return {
    isTabManagerVisible: state.tabmanage.showManager,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    updateWebState: (id: number) => {
      dispatch(updateWebState(id,
                            false,
                            false,
                            '',
                            '主页',
                            true));
    },
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
