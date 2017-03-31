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
import FS from '../fs/fsutils'
import MIME from '../fs/mime'
import * as IMG from '../assets/imageAssets'
import * as Consts from '../utils/Consts'

var RNFS = require('react-native-fs');

const dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class DownloadedPage extends Component {
  state = {
    downloadData: []
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.downloadData !== this.state.downloadData) {
      return true;
    }
    if (nextProps.rawData !== this.props.rawData) {
      this.updateData();
      return false;
    }
    return false;
  }

  componentDidMount() {
    this.updateData();
  }

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
    let listData =  dataSource.cloneWithRows(this.state.downloadData);
    if (listData.getRowCount() === 0) {
      console.log('dataList 0');
      return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Text>当前没有下载内容</Text>
        </View>
      )
    }
    console.log('dataList 不为0: ' + listData.getRowCount());
    return (
      <ListView
        dataSource={listData}
        renderRow={rowData => this.renderItem(rowData)}
      />
    )
  }

  renderItem = (itemData) => {
    let path = itemData.path;
    let mime = FS.getMimeByPath(path);
    let source = null;
    if (!itemData.exist) {
      source = IMG.ICON_DOCUMENT;
    } else {
      if (mime === MIME['.apk']) {
        source = IMG.ICON_APK;
      } else if (mime === MIME['.jpg'] || mime === MIME['.png'] || mime === MIME['bmp']) {
        let fileUri = 'file://' + itemData.path;
        source = {uri: fileUri}
      } else {
        source = IMG.ICON_DOCUMENT;
      }
    }
    return (
      <TouchableOpacity
        style={{flex: 1, height: 56}}
        onPress={() => this.open(itemData)}>
        <View style={styles.item_container}>
          <Image
            source={source}
            resizeMode={'cover'}
            style={{width: 50, height: 50, marginRight: 8}}/>
          <Text
            style={styles.title}
            numberOfLines={1}>
            {itemData.title}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  updateData = () => {
    let promises = this.props.rawData.map(e => RNFS.exists(e.path));
    Promise.all(promises).then(result => {
      // 不显示失效文件
      var temp = this.props.rawData.filter((e, i) => result[i] === true);
      temp.map((e, i) => {
        temp[i] = {
          ...e,
          exist : result[i],
        }
      })
      this.setState({
        downloadData: temp
      });
    });
  }

  open = (itemData: Object) => {
    if (!itemData.exist) {
      alert('文件不存在');
      return;
    }
    FS.open(itemData.path)
    .then((msg) => {
        console.log('success!!')
    },() => {
        console.log('error!!')
    });
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
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f3',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: Consts.spFont(16),
    color: 'black',
  },
})

function mapStateToProps(state) {
  return {
    rawData: state.download.downloaded,
  }
}

function mapDispatchToProps(dispatch) {
  return {
  }
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps)(DownloadedPage);
