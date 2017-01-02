// @flow

import React, {PropTypes, Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ListView
} from 'react-native';

import {connect} from 'react-redux'

const dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class DownloadedPage extends Component {
  render() {
    return (
      <View style={{
        flex: 1,
        backgroundColor: 'white'
      }}>
      {this.renderBody()}
      </View>
    )
  }

  renderBody = () => {
    let dataSource = this.props.dataSource;
    if (dataSource.getRowCount() === 0) {
      console.log('dataList 0');
      return (
        <Text>当前没有下载内容</Text>
      )
    }
    console.log('dataList 不为0: ' + dataSource.getRowCount());
    return (
      <ListView
        dataSource={this.props.dataSource}
        renderRow={(rowData) =>
            <Text>{rowData.title}</Text>
        }
      />
    )
  }
}

function mapStateToProps(state) {
  return {
    dataSource: getListData(state.download.downloaded),
  }
}

function mapDispatchToProps(dispatch) {
  return {
  }
}

function getListData(data: Array<number>) {
  console.log('getListData:' + data.toString());
  return dataSource.cloneWithRows(data);
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps)(DownloadedPage);
