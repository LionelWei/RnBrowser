/* @flow */

import React, { Component, PropTypes } from 'react'

import {
  Image,
  View,
  Text,
  StyleSheet,
  ListView,
  TouchableOpacity
} from 'react-native'
import {connect} from 'react-redux'

import {append, remove} from '../reducers/searchhistory'
import {Emitter} from '../events/Emitter'

const dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class SearchHistoryList extends Component {

  static propTypes = {
    append: PropTypes.func,
    remove: PropTypes.func,
    listData: PropTypes.object
  }

  constructor() {
    super();
  }

  _ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

  render() {
    return (
      <ListView
        dataSource={this.props.listData}
        renderRow={(rowData) => this.renderItem(rowData)}
      />
    );
  }

  renderItem = (itemData) => {
    return (
      <TouchableOpacity
        style={{flex: 1, height: 48}}
        onPress={() => this.props.append()}>
        <View style={styles.item_container}>
          <Text
            style={styles.title}
            numberOfLines={1}>
            {itemData}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
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
    fontSize: 16,
    color: 'black',
    alignSelf: 'center'
  },
})
function mapStateToProps(state) {
  return {
    listData: getListData(state.searchhistory.list)
  }
}

function mapDispatchToProps(dispatch) {
  return {
    append: () => dispatch(append(123)),  // 测试
    remove: () => dispatch(remove(123))   // 测试
  }
}

function getListData(data: Array<number>) {
  console.log('getListData:' + data.toString());
  return dataSource.cloneWithRows(data);
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps)(SearchHistoryList)
