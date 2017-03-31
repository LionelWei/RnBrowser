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
  PanResponder,
  Alert
} from 'react-native';
import {
  isIOS,
  BOTTOM_BAR_HEIGHT,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from '../../utils/Consts'
import {connect} from 'react-redux'
import {Emitter} from '../../events/Emitter'
import WebPage from '../web/WebPage'
import TabTitleBar from './TabTitleBar'
import TabBottomBar from './TabBottomBar'
import Transitions from '../../animation/NavigatorAnimation'
import WebsiteIcon from './WebsiteIcon'
import {MAIN_WEBSITES} from './CommonWebSites'
import * as IMG from '../../assets/imageAssets'

const TAB_TITLE = '主页';

class TabPage extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    onSearchUrlChanged: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
  }
  titleBar = {};

  getTitleText = () => {
    return TAB_TITLE;
  }

  updateTitle = () => {
    this.props.onTitleUpdate && this.props.onTitleUpdate(this.props.index, TAB_TITLE, '');
  }

  componentDidMount() {
    this.updateTitle()
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }

  render() {
    return (
      <View style={{
        flex: 1,
        flexDirection: 'column',
      }}>
        <View style={{flex: 1, justifyContent: 'center'}}>
          <View style={{height: 60}}/>
          {this.renderLogo()}
          {this.renderTitleBar()}
          {this.renderContent()}
        </View>
        {this.renderBottomBar()}
      </View>
    )
  }

  renderLogo = () => {
    return (
      <View style={{alignItems: 'center', marginBottom: 24}}>
        <Image
          style={{
            height: 48
          }}
          source={IMG.HOME_LOGO}
          resizeMode={Image.resizeMode.contain}/>
      </View>
    )
  }

  renderTitleBar = () => {
    return <TabTitleBar
            ref={(titleBar) => this.titleBar = titleBar}
            onUrlChanged={this.props.onSearchUrlChanged}
            onSearch={() => this.props.onSearch()}
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
      <View
        style={{height: 250, backgroundColor: 'white'}}>
        <View style={{
          marginTop: 30,
          marginLeft: 10,
          marginRight: 10,
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'flex-start'

        }}>
          {this.renderWebSites()}
        </View>
      </View>
    )
  }

  renderWebSites = () => {
    return (
      MAIN_WEBSITES.map((elem, index) => {
        return <WebsiteIcon
                {...this.props}
                key={index}
                pressFn={() => {this.props.goToWebWithConfirm(elem[0])}}
                desc={elem[1]}
                icon={elem[2]}
                backgroundColor={elem[3]}
                borderColor={elem[4]}/>
      })
    )
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
