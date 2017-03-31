// @flow

import React, {PropTypes, Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import NavigationBar from 'react-native-navbar';

import {connect} from 'react-redux'

import * as IMG from '../assets/imageAssets'
import {Emitter} from '../events/Emitter'

const backIcon = IMG.ICON_BACK_NORMAL;

class BackButton extends Component {
  render() {
    return (
      <TouchableOpacity
        onPress={this.props.pressFn}>
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Image
            source={backIcon}
            style={[{ width: 20, height: 20, }, this.props.style]}/>
        </View>
      </TouchableOpacity>
    );
  }
}

class NavBar extends Component {
  static propTypes = {
    title: PropTypes.string,
    onBack: PropTypes.func,
    rightButtonConfig: PropTypes.object,
  }

  render() {
    let leftButtonConfig;
    let rightButtonConfig = this.props.rightButtonConfig;
    if (this.props.onBack) {
      leftButtonConfig =
        <BackButton
          style={{ marginLeft: 8 }}
          pressFn={() => this.props.onBack()}
          />
    } else {
      leftButtonConfig = {}
    }

    const titleConfig = {
      title: this.props.title,
    };

    return (
      <NavigationBar
        statusBar={{hidden: false}}
        style={styles.navBorder}
        title={titleConfig}
        leftButton={leftButtonConfig}
        rightButton={rightButtonConfig}/>
    );
  }
}

const styles = StyleSheet.create({
  navBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f3'
  }
})

module.exports = NavBar
