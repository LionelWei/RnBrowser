// @flow

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
  WebView,
  TouchableWithoutFeedback
} from 'react-native';
import {NAV_BAR_HEIGHT ,BOTTOM_BAR_HEIGHT} from '../../utils/Consts'
import {connect} from 'react-redux'
import {Emitter} from '../../events/Emitter'
import WebPage from '../web/WebPage'
import TabTitleBar from './TabTitleBar'
import TabBottomBar from './TabBottomBar'
import Transitions from '../../animation/NavigatorAnimation'
import WebsiteIcon from './WebsiteIcon'
import * as SITES from './CommonWebSites'
import * as IMG from '../../assets/imageAssets'

import {SCREEN_WIDTH} from '../../utils/Consts'

class TabPage extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
  }
  titleBar = {}

  getTitleText = () => {
    console.log('==== getTitleText: ' + this.titleBar.getTitleText());
    return this.titleBar.getTitleText();
  }

  render() {
    console.log('******** Tabpage onRender ********');
    return (
      <View style={{
        flex: 1,
        flexDirection: 'column',
      }}>
        {this.renderTitleBar()}
        {this.renderContent()}
        {this.renderBottomBar()}
      </View>
    )
  }

  renderTitleBar = () => {
    return <TabTitleBar
            ref={(titleBar) => this.titleBar = titleBar}
            onUrlChanged={(url: string) => this.onUrlChanged(url)}
            navigator={this.props.navigator}/>
  }

  renderBottomBar = () => {
    return <TabBottomBar
            menuPressFn={this.props.menuPressFn}
            tabPressFn={this.props.tabPressFn}
            />
  }

  renderContent() {
    return (
      <View style={{flex: 1}}>
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
          <WebsiteIcon
            pressFn={() => {this.gotoWeb(SITES.CNBETA)}}
            icon={IMG.CNBETA_ICON}/>
        </View>
      </View>
    )
  }

  onUrlChanged = (url) => {
    setTimeout(() => this.gotoWeb(url), 100);
  }

  gotoWeb = (url: string) => {
    console.log('=== gotoWeb url: ' + url);
    this.props.navigator.push({
      component: WebPage,
      scene: Transitions.NONE,
      id: this.props.id,
      url: url,
      menuPressFn: this.props.menuPressFn,
      tabPressFn: this.props.tabPressFn,
    })
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
  }
}

module.exports = connect(
  mapStateToProps,
  null, null, {withRef: true})(TabPage)
