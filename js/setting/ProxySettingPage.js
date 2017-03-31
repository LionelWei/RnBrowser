// @flow

import React, {PropTypes, Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ListView,
  TouchableOpacity,
  Switch,
  TextInput,
  AsyncStorage,
} from 'react-native';

import NavBar from '../components/NavBar';
import Transitions from '../animation/NavigatorAnimation'
import {connect} from 'react-redux'
import * as IMG from '../assets/imageAssets'
import {Emitter} from '../events/Emitter'
import {configProxy} from '../nativemodules/WebProxySetting'
import {
  PROXY_IP,
  PROXY_PORT,
  PROXY_UN,
  PROXY_PWD,
  PROXY_ENABLED,
  DEFAULT_IP,
  DEFAULT_PORT,
} from '../utils/ProxyConsts'
import * as Consts from '../utils/Consts'

class ProxySettingPage extends Component {
  state = {
    isProxyOn: true,
    proxyInfo: {
      ip: '',
      port: '',
      userName: '',
      password: '',
    }
  }

  static propTypes = {
    navigator: PropTypes.object.isRequired,
  }

  localStore = {
    ip: '',
    port: '',
    userName: '',
    password: '',
  }

  componentDidMount() {
    AsyncStorage.multiGet(
      [PROXY_IP, PROXY_PORT, PROXY_UN, PROXY_PWD, PROXY_ENABLED])
      .then(arr => {
        console.log(arr);
        this.localStore = {
          ip: arr[0][1],
          port: arr[1][1],
          userName: arr[2][1],
          password: arr[3][1],
        }
        let isProxyOn = arr[4][1];
        this.setState({
          proxyInfo: this.localStore,
          isProxyOn: isProxyOn === '1' ? true : false
        })
      })
  }

  componentWillUnmount() {
    this.back()
  }

  render() {
    return (
      <View style={styles.container}>
        <NavBar
          title={'免流量代理'}
          onBack={() => this.props.navigator.pop()}
        />
        {this.renderProxy()}
      </View>
    );
  }

  renderProxy = () => {
    return (
      <View style={{flex: 1}}>
        <TouchableOpacity
          style={{height: 56}}
          onPress={() => this.setState({isProxyOn: !this.state.isProxyOn})}>
          <View style={styles.setting_item}>
            <Text
              style={styles.title}
              numberOfLines={1}>
              免流量代理
            </Text>
            <Switch
              onValueChange={(value) => this.setState({isProxyOn: value})}
              value={this.state.isProxyOn} />
          </View>
        </TouchableOpacity>
        {this.renderConfig()}
      </View>
    )
  }

  renderConfig = () => {
    let isProxyOn = this.state.isProxyOn;
    if (!isProxyOn) {
      return null;
    }
    return (
      <View style={{flexDirection: 'column'}}>
        <View style={{flexDirection: 'row', alignItems: 'center', height: 50}}>
          <Text style={styles.config_desc}> IP </Text>
          <TextInput
            ref='1'
            style={styles.config_input}
            placeholder='默认 180.96.49.56'
            keyboardType="numeric"
            defaultValue={this.localStore.ip}
            onChangeText={(text) => this.updateIp(text)}
            underlineColorAndroid='transparent'
            onSubmitEditing={() => this.focusNextField('2')}
          />
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center', height: 50}}>
          <Text style={styles.config_desc}> 端口号 </Text>
          <TextInput
            ref='2'
            style={styles.config_input}
            placeholder='默认 8313'
            keyboardType="numeric"
            defaultValue={this.localStore.port}
            onChangeText={(text) => this.updatePort(text)}
            onSubmitEditing={() => this.focusNextField('3')}
            underlineColorAndroid='transparent'
          />
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center', height: 50}}>
          <Text style={styles.config_desc}> 用户名 </Text>
          <TextInput
            ref='3'
            style={styles.config_input}
            placeholder='默认为空'
            defaultValue={this.localStore.userName}
            onChangeText={(text) => this.updateUserName(text)}
            onSubmitEditing={() => this.focusNextField('4')}
            underlineColorAndroid='transparent'
          />
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center', height: 50}}>
          <Text style={styles.config_desc}> 密码 </Text>
          <TextInput
            ref='4'
            style={styles.config_input}
            placeholder='默认为空'
            onChangeText={(text) => this.updatePwd(text)}
            defaultValue={this.localStore.password}
            underlineColorAndroid='transparent'
            returnKeyType="done"
          />
        </View>
      </View>
    )
  }

  back = () => {
    let data = this.localStore;
    let enabled = this.state.isProxyOn

    if (this.checkEmpty()) {
      enabled = false;
    }

    console.log('back: data: ip: ' + data.ip + ', port: ' + data.port)
    AsyncStorage.multiSet([
      [PROXY_IP, data.ip || DEFAULT_IP],
      [PROXY_PORT, data.port || DEFAULT_PORT],
      [PROXY_UN, data.userName || ''],
      [PROXY_PWD, data.password || ''],
      [PROXY_ENABLED, enabled ? '1' : '0']
    ], err => {console.log(err)})

    configProxy({
      enabled: enabled,
      ip: data.ip || '',
      port: parseInt(data.port) || 0,
      userName: data.userName || '',
      password: data.password || ''
    })
  }

  focusNextField(nextField) {
    this.refs[nextField].focus();
  }

  updateIp = (ip) => {
    this.localStore.ip = ip;
  }

  updatePort = (port) => {
    this.localStore.port = port
  }

  updateUserName = (un) => {
    this.localStore.userName = un;
  }

  updatePwd = (pwd) => {
    this.localStore.password = pwd;
  }

  checkEmpty() {
    if (!this.state.isProxyOn) {
      return false
    }

    return false;

    // 如果ip和端口号为空, 则使用默认值
    // let data = this.localStore
    // let prefix: string = ''
    // let empty = true
    // if (isEmpty(data.ip)) {
    //   prefix = 'IP'
    // } else if (isEmpty(data.port)) {
    //   prefix = '端口号'
    // } /* else if (isEmpty(data.userName)) {
    //   prefix = '用户名'
    // } else if (isEmpty(data.password)) {
    //   prefix = '密码'
    // }*/ else {
    //   empty = false
    // }
    //
    // return empty
    //
    // function isEmpty(s: string) {
    //   return !s || s.length === 0
    // }

  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  setting_item: {
    flex:1,
    flexDirection: 'row',
    paddingLeft: 12,
    paddingRight: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f3',
    height: 56,
    alignItems: 'center'
  },
  title: {
    flex: 1,
    fontSize: Consts.spFont(16),
    color: 'black',
    alignSelf: 'center'
  },
  config_desc: {
    marginLeft: 12,
    fontSize: Consts.spFont(16),
    width: 60,
    color: 'black',
  },
  config_input: {
    flex: 1,
    fontSize: Consts.spFont(16),
    color: 'black',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f3',
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
  mapDispatchToProps)(ProxySettingPage);
