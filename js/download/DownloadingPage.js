// @flow

import React, {PropTypes, Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ListView,
  TouchableOpacity
} from 'react-native';

import {connect} from 'react-redux'

const dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class DownloadingPage extends Component {
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
        renderRow={(rowData) => this.renderItem(rowData)}
      />
    )
  }

  renderItem = (itemData) => {
    return (
      <TouchableOpacity
        style={{flex: 1, height: 56}}
        onPress={() => alert(itemData.title)}>
        <View style={styles.item_container}>
          <Text
            style={styles.title}
            numberOfLines={1}>
            {itemData.title}
          </Text>
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
    flexDirection: 'column',
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f3',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 16,
    color: 'black',
  },
})

function mapStateToProps(state) {
  return {
    dataSource: getListData(state.download.downloading),
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
  mapDispatchToProps)(DownloadingPage);
