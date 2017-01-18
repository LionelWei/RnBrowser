// @flow

import React, {PropTypes, Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ListView,
  TouchableOpacity,
  BackAndroid,
  Platform,
  Switch,
  AsyncStorage,
} from 'react-native';

import NavBar from '../components/NavBar';
import ProxySettingPage from './ProxySettingPage'
import Transitions from '../animation/NavigatorAnimation'
import {connect} from 'react-redux'
import * as IMG from '../assets/imageAssets'

import {removeAll as removeSearchHistory} from '../reducers/searchhistory'
import {removeAll as removeBrowseHistory} from '../reducers/browsehistory'
import {isIOS} from '../utils/Consts'
import {chooseWebKit} from '../nativemodules/WebkitChoose'

const IS_X5 = 'IS_X5'
class SettingPage extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
  }

  state = {
    isX5: false
  }
  componentDidMount() {
    AsyncStorage.getItem(IS_X5, (err, result) => {
      console.log('isX5 ' + result);
      this.setState({
        isX5: result === '1' ? true : false
      })
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <NavBar
          title={'设置'}
          onBack={() => this.props.navigator.pop()}
        />
        {this.renderWebkitChoose()}
        {this.renderProxy()}
        {this.renderClear()}
        {this.renderExit()}
      </View>
    );
  }

  renderWebkitChoose = () => {
    if (isIOS) {
      return null
    }
    return (
      <View style={styles.x5_setting}>
        <Text
          style={styles.title}
          numberOfLines={1}>
          启用X5内核
        </Text>
        <Switch
          onValueChange={value => this.chooseWebkit(value)}
          value={this.state.isX5} />
      </View>
    )

  }

  renderProxy = () => {
    return (
      <TouchableOpacity
        style={{height: 56}}
        onPress={this.pushProxySetting}>
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

  renderClear = () => {
    return (
      <TouchableOpacity
        style={{height: 56}}
        onPress={this.clearHistory}>
        <View style={styles.item_container}>
          <Text
            style={styles.title}
            numberOfLines={1}>
            清除历史
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  renderExit = () => {
    return (
      isIOS
      ? null
      : <TouchableOpacity
          style={{height: 56}}
          onPress={this.exit}>
          <View style={styles.item_container}>
            <Text
              style={styles.title}
              numberOfLines={1}>
              退出
            </Text>
         </View>
       </TouchableOpacity>
    )
  }

  chooseWebkit = (isX5: bool) => {
    this.setState({isX5: isX5})
    AsyncStorage.setItem(IS_X5, isX5 ? '1' : '0');
    chooseWebKit({isX5: isX5})
    setTimeout(() => alert('必须重启APP, 才能生效'), 300)
  }

  pushProxySetting = () => {
    this.props.navigator.push({
      component: ProxySettingPage,
      scene: Transitions.LeftToRight,
    })
  }

  clearHistory = () => {
    this.props.removeSearchHistory()
    this.props.removeBrowseHistory()
    alert('历史记录已清除')
  }

  exit = () => {
    BackAndroid.exitApp();
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
  x5_setting: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f3',
    height: 56,
    alignItems: 'center'
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
    removeSearchHistory: () => dispatch(removeSearchHistory()),
    removeBrowseHistory: () => dispatch(removeBrowseHistory())
  }
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps)(SettingPage);
