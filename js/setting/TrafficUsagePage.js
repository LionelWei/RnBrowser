// @flow

import React, {PropTypes, Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ListView,
  TouchableOpacity,
  AsyncStorage
} from 'react-native';

import NavBar from '../components/NavBar';
import * as TrafficStats from '../nativemodules/TrafficStats'
import * as Consts from '../utils/Consts'

const FREE_LIMITED = 2048;

class TrafficUsagePage extends Component {

  state = {
    totalUsed: '',
    freeUsed: '',
    freeRemained: '',
  }

  componentWillMount() {
    AsyncStorage.getItem('FREE_THRESHOLD', (err, result) => {
      TrafficStats.getMobileBytes().then((res) => {
        this.setState({
          totalUsed: this.getUsageMB(+res)
        })
      });
      TrafficStats.getFreeBytes().then((res) => {
        this.setState({
          freeUsed: this.getUsageMB(+res),
          freeRemained: this.getRemainFreeMB(+res, +result)
        })
      });
    })
  }

  render() {
    return (
      <View style={{
        flex: 1,
        backgroundColor: 'white'
      }}>
        <NavBar
          title={'流量统计'}
          onBack={() => this.props.navigator.pop()}
        />
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={styles.traffic}>数据流量: {this.state.totalUsed}</Text>
          <Text style={styles.traffic}>已免流量: {this.state.freeUsed}</Text>
          <Text style={styles.traffic}>剩余免流量: {this.state.freeRemained}</Text>
        </View>
        <Text style={styles.disclaimer}> 以上数据仅供参考, 实际流量消耗以网厅账单为准</Text>
      </View>
    )
  }

  getUsageMB = (rxBytes: number) => {
    if (rxBytes < 0) {
      return '暂不支持';
    }
    let rxMB = rxBytes / 1024 / 1024;
    return rxMB.toFixed(1) + ' MB';
  }

  getRemainFreeMB = (rxBytes: number, threhold: number) => {
    if (rxBytes < 0) {
      return '暂不支持';
    }
    let rxMB = rxBytes / 1024 / 1024;
    let totalFreeMB = threhold / 1024 / 1024;
    let remainMB = totalFreeMB - rxMB;
    return remainMB.toFixed(1) + ' MB';
  }

}

const styles = StyleSheet.create({
  traffic: {
    fontSize: Consts.spFont(20),
    marginBottom: 20,
    color: 'black'
  },
  disclaimer: {
    fontSize: Consts.spFont(10),
    marginLeft: 10,
    marginBottom: 30,
  }
})

module.exports = TrafficUsagePage;
