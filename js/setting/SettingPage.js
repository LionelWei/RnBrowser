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
  Alert
} from 'react-native';

import NavBar from '../components/NavBar';
import ProxySettingPage from './ProxySettingPage'
import TrafficUsagePage from './TrafficUsagePage'
import AboutPage from './AboutPage'
import Transitions from '../animation/NavigatorAnimation'
import {connect} from 'react-redux'
import * as IMG from '../assets/imageAssets'

import {removeAll as removeSearchHistory} from '../reducers/searchhistory'
import {removeAll as removeBrowseHistory} from '../reducers/browsehistory'
import {removeAllDownload as removeDownload} from '../reducers/download'
import * as Consts from '../utils/Consts'
import {chooseWebKit} from '../nativemodules/WebkitChoose'

const IS_X5 = 'IS_X5';

const CANCEL_TEXT = '取消';
const CONFIRM_TEXT = Consts.isIOS ? '好' : '确认';
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

  componentWillUnmount() {
    this.props.onNavigatorPop && this.props.onNavigatorPop();
  }

  render() {
    return (
      <View style={styles.container}>
        <NavBar
          title={'设置'}
          onBack={() => this.props.navigator.pop()}
        />
        {this.renderTrafficUsage()}
        {this.renderClear()}
        {this.renderDeleteDownload()}
        {this.renderAbout()}
        {this.renderExit()}
      </View>
    );
  }

  // 暂时隐藏
  renderWebkitChoose = () => {
    if (Consts.isIOS) {
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

  // 暂时隐藏
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

  renderTrafficUsage = () => {
    return (
      <TouchableOpacity
        style={{height: 56}}
        onPress={this.pushTrafficUsage}>
        <View style={styles.item_container}>
          <Text
            style={styles.title}
            numberOfLines={1}>
            流量统计
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

  renderDeleteDownload = () => {
    return (
      <TouchableOpacity
        style={{height: 56}}
        onPress={this.deleteDownload}>
        <View style={styles.item_container}>
          <Text
            style={styles.title}
            numberOfLines={1}>
            清空下载
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  renderAbout = () => {
    return (
      <TouchableOpacity
        style={{height: 56}}
        onPress={this.about}>
        <View style={styles.item_container}>
          <Text
            style={styles.title}
            numberOfLines={1}>
            关于
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  renderExit = () => {
    return (
      Consts.isIOS
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

  pushTrafficUsage = () => {
    this.props.navigator.push({
      component: TrafficUsagePage,
      scene: Transitions.LeftToRight,
    })
  }

  pushProxySetting = () => {
    this.props.navigator.push({
      component: ProxySettingPage,
      scene: Transitions.LeftToRight,
    })
  }

  deleteDownload = () => {
    this.confirmWithPrompt('确定清空下载内容吗?', () => {
      this.props.removeDownload();
    })
  }

  clearHistory = () => {
    this.confirmWithPrompt('确定清除历史记录吗?', () => {
      this.props.removeSearchHistory();
      this.props.removeBrowseHistory();
    });
  }

  about = () => {
    this.props.navigator.push({
      component: AboutPage,
      scene: Transitions.LeftToRight,
    })
  }

  exit = () => {
    this.confirmWithPrompt('确定退出吗?', () => {
      BackAndroid.exitApp();
    });
  }

  confirmWithPrompt = (description: string, confirmFn: Function) => {
    Alert.alert(
      '',
      description,
      [
        {
          text: CANCEL_TEXT,
          onPress: () => {}
        },
        {
          text: CONFIRM_TEXT,
          onPress: () => {
            confirmFn && confirmFn();
          }
        }
      ]
    );
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
    fontSize: Consts.spFont(16),
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
    borderColor: '#888888',
    marginRight: 20,
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
    removeBrowseHistory: () => dispatch(removeBrowseHistory()),
    removeDownload: () => dispatch(removeDownload()),
  }
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps)(SettingPage);
