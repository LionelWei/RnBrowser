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
  Alert,
  ActivityIndicator
} from 'react-native';

import NavBar from '../components/NavBar';
import * as IMG from '../assets/imageAssets'
import * as Progress from 'react-native-progress';
import * as CheckUpdate from '../nativemodules/CheckUpdate'
import {Emitter} from '../events/Emitter'
import * as Consts from '../utils/Consts'

class AboutPage extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
  }

  state = {
    currentVersion: '',
    isShowLoading: false
  }

  isUpdateCanceledByUser = false;

  componentWillMount() {
    CheckUpdate.getCurrentVersion().then((res) => {
      this.setState({
        currentVersion: res
      })
    })
  }
  render() {
    return (
      <View style={styles.container}>
        <NavBar
          title={'关于'}
          onBack={() => this.props.navigator.pop()}
          rightButtonConfig={{
            title: '检查更新',
            handler: this.checkUpdate,
          }}
        />
        <View style={{height: 80}}/>
        {this.renderContent()}
        {this.renderLoadingView()}
      </View>
    );
  }

  renderContent = () => {
    return (
      <View style={{flex: 1, alignItems: 'center', marginBottom: 8}}>
        <View style={{flex: 1, alignItems: 'center'}}>
          <Image
            style={{
              height: 72
            }}
            source={IMG.BROWSER_LOGO}
            resizeMode={Image.resizeMode.contain}/>
          <Text style={styles.black}>
            青蜂浏览器
          </Text>
          <Text style={{marginTop: 8, color: '#888888'}}>
            版本号: {this.state.currentVersion}
          </Text>
          <View style={{flex: 1, justifyContent: 'center', paddingBottom: 60}}>
            <View style={{alignItems: 'center', marginBottom: 4}}>
              <Text style={[styles.black, {fontSize: Consts.spFont(16)}]}>
                炫彩产品开发中心B项目团队
              </Text>
            </View>
            <View style={{alignItems: 'center'}}>
              <View style={styles.worker_container}>
                <Text style={[styles.worker_left, styles.black]}>
                  策划人:
                </Text>
                <Text style={styles.black}>
                  江南忆HEIN
                </Text>
              </View>
              <View style={styles.worker_container}>
                <Text style={[styles.worker_left, styles.black]}>
                  Android:
                </Text>
                <Text style={styles.black}>
                  LionelW
                </Text>
              </View>
              <View style={styles.worker_container}>
                <Text style={[styles.worker_left, styles.black]}>
                  iOS:
                </Text>
                <Text style={styles.black}>
                  反手狂魔
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 20}}>
          <Text style={[{marginRight: 2, fontSize: Consts.spFont(16)}, styles.black]}>
            Powered by
          </Text>
          <Image
            style={{
              width: 24,
              height: 24
            }}
            source={IMG.REACT_LOGO}
            resizeMode={Image.resizeMode.contain}/>
          <Text style={{fontSize: Consts.spFont(16), marginLeft: 2, color: 'rgb(97, 218, 251)'}}>
            React Native
          </Text>
        </View>
        <View style={{marginBottom: 20}}>
          <Text style={{color: '#888888'}}>
          Copyright ProductDev@XCHD
          </Text>
        </View>
      </View>
    )
  }

  renderLoadingView = () => {
    if (!Consts.isIOS) {
      return null;
    }
    if (!this.state.isShowLoading) {
      return null;
    }
    else {
      return (
        <View style={{
          position: 'absolute',
          top: Consts.STATUS_BAR_HEIGHT,
          width: Consts.SCREEN_WIDTH,
          height: Consts.SCREEN_HEIGHT,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'black',
          opacity: 0.4,
        }}>
          <ActivityIndicator
            style={{
              padding: 8,
            }}/>
        </View>
      )
    }
  }

  checkUpdate = () => {
    this.isUpdateCanceledByUser = false;
    if (Consts.isIOS) {
      this.setState({
        isShowLoading: true
      });
    } else {
      Alert.alert(
        '',
        '检查更新中...',
        [
          {
            text: '取消',
            onPress: () => {
              this.isUpdateCanceledByUser = true;
            }
          },
        ]
      );
    }
    setTimeout(() => {
      this.doCheckUpdate();
    }, 300);
  }

  doCheckUpdate = () => {
    CheckUpdate.checkUpdate().then((res) => {
      if (Consts.isIOS) {
        this.setState({
          isShowLoading: false
        });
      }
      if (this.isUpdateCanceledByUser) {
        return;
      }

      let downloadUrl = res.downloadUrl || null;
      let needUpdate = res.needUpdate || false;
      if (needUpdate) {
        Alert.alert(
          '',
          '有更新版本',
          [
            {
              text: '取消',
              onPress: () => {}
            },
            {
              text: '去更新',
              onPress: () => {
                Emitter.emit("app_update", downloadUrl);
              }
            }
          ]
        );
      } else {
        Alert.alert(
          '',
          '当前已是最新版本',
          [
            {
              text: '确定',
              onPress: () => {
              }
            }
          ]
        );
      }
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  title: {
    flex: 1,
    fontSize: Consts.spFont(16),
    paddingLeft: 12,
    color: 'black',
    alignSelf: 'center'
  },
  worker_container: {
    flexDirection: 'row',
    width: 150,
  },
  worker_left: {
    width: 68,
  },
  black: {
    color: 'black'
  }
})

module.exports = AboutPage;
