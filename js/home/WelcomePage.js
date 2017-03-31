/* @flow */

import React, { Component, PropTypes } from 'react'

import {
  StyleSheet,
  View,
  Modal,
  Navigator,
  Text,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import NavBar from '../components/NavBar';
import * as IMG from '../assets/imageAssets';
import * as Consts from '../utils/Consts'

const TOP_MARGIN = Consts.NAV_BAR_HEIGHT - Consts.STATUS_BAR_HEIGHT;
const EULA = '此款作品为炫彩产品开发中心的童鞋业余自研作品'
            + '虽说我们声称可以免掉电信用户每月至少500MB的流量'
            + '但是我们也不是神啊鬼知道代码什么地方出了问题'
            + '如果发现流量没有免掉请及时告知我们我们会认错的'
            + '哦对了透露一个小秘密其实有个BUG可以不止500MB';

class WelcomePage extends Component {
  static propTypes = {
    navigator: PropTypes.object
  };

  render() {
    const {navigator} = this.props
    const rightButtonConfig = {
      title: '进入',
      handler: () => alert('hello!'),
    };
    return (
      <View style={{flex: 1}}>
      <ScrollView>
        <View style={{flex: 1, marginTop: TOP_MARGIN}}>
          <View style={{alignItems: 'center',
              marginLeft: 32,
              marginRight: 32,
            }}>
            <Text style={[{marginTop: 20, fontSize: Consts.spFont(24)}, styles.black]}>
              欢迎使用
            </Text>
            <Image
              style={{
                height: 60
              }}
              source={IMG.BROWSER_LOGO}
              resizeMode={Image.resizeMode.contain}/>
            <Text style={[{fontSize: Consts.spFont(16), color: 'rgb(0, 178, 255)'}, styles.black]}>
              青蜂浏览器
            </Text>
            <Text style={[styles.black, {marginTop: 20}]}>
              是否厌倦了某U，某Q，某3浏览器的臃肿？ {"\n"}
              亦或是月底发现流量不够用了？{"\n"}
              是时候体验一下清爽极速的浏览体验了！{"\n"}
              像蜂鸟一样飞翔！{"\n"}
            </Text>
            <View style={{
              alignItems: 'center',
              backgroundColor: '#f1f2f3',
              marginTop: 8,
              paddingTop: 4,
              paddingBottom: 8}}>
              <Text style={[styles.black, {marginTop: 4, fontSize: Consts.spFont(14)}]}>
                免责声明
              </Text>
              <Text style={{
                paddingTop: 8,
                paddingLeft: 8,
                paddingRight: 8,
                color: 'gray'}}>
                {EULA}
              </Text>
            </View>
          </View>
          <View style={{
              flex: 1,
              marginLeft: 32,
              marginRight: 32,
              paddingTop: 20,
              justifyContent: 'center'
            }}>
            <Text style={styles.black}>
              还有一件事，{"\n"}
              忘了告诉你们出了问题应该找谁 {"\n"}
              —— 找公司颜值最高的人就行了
            </Text>
          </View>
        </View>
      </ScrollView>
        <View style={{
          flexDirection: 'row',
          height: Consts.BOTTOM_BAR_HEIGHT,
          borderTopWidth: 1,
          borderTopColor: '#f1f2f3'}}>
          <View style={{flex:1}}/>
          <View style={{justifyContent: 'center'}}>
          <TouchableOpacity onPress={this.onPressEnter}>
            <Text style={{
              fontSize: Consts.spFont(16),
              color: '#0076FF',
              marginLeft: 12,
              marginRight: 12}}>
              领取流量并进入
            </Text>
          </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  onPressEnter = () => {
    this.props.onPressEnter && this.props.onPressEnter();
  }
}

const styles = StyleSheet.create({
  black: {
    color: 'black'
  }
})

module.exports = WelcomePage;
