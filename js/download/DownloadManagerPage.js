// @flow

import React, {PropTypes, Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import { TabViewAnimated, TabBar } from 'react-native-tab-view';
import {
  SCREEN_WIDTH,
} from '../utils/Consts'

import NavBar from '../components/NavBar';
import DownloadingPage from './DownloadingPage'
import DownloadedPage from './DownloadedPage'

import {connect} from 'react-redux'
import * as IMG from '../assets/imageAssets'
import {Emitter} from '../events/Emitter'


class DownloadManagerPage extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
  }

  state = {
    index: 0,
    routes: [
      { key: '1', title: '已下载' },
      { key: '2', title: '正在下载' },
    ],
  };

  componentWillUnmount() {
    this.props.onNavigatorPop && this.props.onNavigatorPop();
  }

  render() {
    return (
      <View style={styles.container}>
        <NavBar
          title={'下载管理'}
          onBack={() => this.props.navigator.pop()}
        />
        {this.renderBody()}
      </View>
    );
  }

  handleChangeTab = (index: number) => {
    this.setState({ index });
  };

  renderHeader = (props: Object) => {
    return <TabBar
            style={{
              backgroundColor: 'white',
            }}
            labelStyle={{
              color: 'black'
            }}
            indicatorStyle={{
              backgroundColor: '#00b4ff',
              position: 'absolute',
              justifyContent: 'center',
              alignItems: 'center',
              left: SCREEN_WIDTH / 4 - 24,
              width: 40,
              bottom: 0,
              height: 2,
            }}
            {...props} />
  };

  renderBody = () => {
    return this.renderDownloadedOnly();
    //  return this.renderDownloadedAndDownloading();
  }

  // 只显示已下载
  renderDownloadedOnly = () => {
    return (
      <DownloadedPage />
    );
  }

  // 显示正在下载和已下载两个tab
  renderDownloadedAndDownloading = () => {
    return (
      <TabViewAnimated
        style={styles.container}
        navigationState={this.state}
        renderScene={this.renderScene}
        renderHeader={this.renderHeader}
        onRequestChangeTab={this.handleChangeTab}
      />
    );
  }

  renderScene = (scene: Object) => {
    switch (scene.route.key) {
    case '1':
      return <DownloadedPage />;
    case '2':
      return <DownloadingPage />;
    default:
      return null;
    }
  };

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

module.exports = DownloadManagerPage
