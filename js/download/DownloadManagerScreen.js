// @flow

import React, {PropTypes, Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import { TabViewAnimated, TabBarTop } from 'react-native-tab-view';

import NavBar from '../components/NavBar';
import DownloadingPage from './DownloadingPage'
import DownloadedPage from './DownloadedPage'

import {connect} from 'react-redux'
import * as IMG from '../assets/imageAssets'
import {Emitter} from '../events/Emitter'


class DownloadManagerScreen extends Component {
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

  render() {
    return (
      <View style={styles.container}>
        <NavBar
          title={'下载管理'}
          onBack={() => this.props.navigator.pop()}
        />
        <TabViewAnimated
          style={styles.container}
          navigationState={this.state}
          renderScene={this.renderScene}
          renderHeader={this.renderHeader}
          onRequestChangeTab={this.handleChangeTab}
        />
      </View>
    );
  }

  handleChangeTab = (index) => {
    this.setState({ index });
  };

  renderHeader = (props) => {
    return <TabBarTop
            style={{
              backgroundColor: 'white'
            }}
            labelStyle={{
              color: 'black'
            }}
            indicatorStyle={{
              backgroundColor: 'transparent'
            }}
            {...props} />
  };

  renderScene = ({ route }) => {
    switch (route.key) {
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

module.exports = DownloadManagerScreen
