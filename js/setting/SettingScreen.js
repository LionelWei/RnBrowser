// @flow

import React, {PropTypes, Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ListView,
  TouchableOpacity,
} from 'react-native';

import NavBar from '../components/NavBar';
import ProxySettingDialog from './ProxySettingDialog'
import {connect} from 'react-redux'
import * as IMG from '../assets/imageAssets'
import {Emitter} from '../events/Emitter'

class SettingScreen extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
  }

  proxySettingDialog = {}

  render() {
    return (
      <View style={styles.container}>
        <NavBar
          title={'设置'}
          onBack={() => this.props.navigator.pop()}
        />
        {this.renderProxy()}
        <ProxySettingDialog ref={(dialog) => this.proxySettingDialog = dialog}/>
      </View>
    );
  }

  renderProxy = () => {
    return (
      <TouchableOpacity
        style={{height: 56}}
        onPress={() => this.proxySettingDialog.open()}>
        <View style={styles.item_container}>
          <Text
            style={styles.title}
            numberOfLines={1}>
            免流量代理
          </Text>
          <View style={styles.rightArrow}/>
        </View>
      </TouchableOpacity>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  item_container: {
    flex:1,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f3',
  },
  title: {
    flex: 1,
    fontSize: 16,
    paddingLeft: 12,
    color: 'black',
    alignSelf: 'center'
  },
  rightArrow: {
    borderTopWidth: 2,
    borderRightWidth: 2,
    width: 10,
    height: 10,
    transform: [{rotate: '45deg'}],
    borderColor: 'black',
    marginRight: 12,
    alignSelf: 'center',
  }
})

function mapStateToProps(state) {
  return {
  }
}

function mapDispatchToProps(dispatch) {
  return {
  }
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps)(SettingScreen);
