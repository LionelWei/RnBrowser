/*
 * @flow */

import React, {PropTypes, Component } from 'react';
import {
  Text,
  Dimensions,
  Navigator,
  StyleSheet
} from 'react-native';
import {NAV_BAR_HEIGHT ,BOTTOM_BAR_HEIGHT} from '../utils/Consts'

import {connect} from 'react-redux'
import {Emitter} from '../events/Emitter'
import {printObj} from '../utils/Common'
import TabPage from './TabPage'

class TabNavigator extends Component {

  render() {
    return (
      <Navigator
        initialRoute={{
          component: TabPage,
          id: this.props.id
        }}
        configureScene={this.configureScene}
        renderScene={(route, navigator) => {
          return <route.component
                    navigator={navigator}
                    {...route}
                    {...route.passProps}/>
        }}
      />
    )
  }

  configureScene (route: Object) {
    return route.scene || Navigator.SceneConfigs.PushFromRight
  }

}

module.exports = TabNavigator;
