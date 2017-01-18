// @flow

import React, {PropTypes, Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ListView,
  TouchableOpacity,
} from 'react-native';
import { TabViewAnimated, TabBarTop } from 'react-native-tab-view';

import NavBar from '../components/NavBar';

import {connect} from 'react-redux'
import * as IMG from '../assets/imageAssets'
import {Emitter} from '../events/Emitter'


const dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class BookBarPage extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
  }
  isRendered = false;

  render() {
    return (
      <View style={styles.container}>
        <NavBar
          title={'历史'}
          onBack={() => this.props.navigator.pop()}
        />
        {this.renderList()}
      </View>
    );
  }

  componentDidMount() {
    if (!this.isRendered) {
      this.isRendered = true;
      this.forceUpdate()
    }
  }

  renderList() {
    return (this.isRendered
          ? <ListView
              dataSource={this.props.dataSource}
              renderRow={(rowData) => this.renderItem(rowData)}
            />
          : null)
  }

  renderItem = (itemData) => {
    return (
      <TouchableOpacity
        style={{flex: 1, height: 56}}
        onPress={() => this.loadWeb(itemData.url)}>
        <View style={styles.item_container}>
          <Text
            style={styles.title}
            numberOfLines={1}>
            {itemData.title}
          </Text>
          <Text
            style={styles.url}
            numberOfLines={1}>
            {itemData.url}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  loadWeb = (url: string) => {
    Emitter.emit('url_changed', url);
    this.props.navigator.pop();
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
  url: {
    flex: 1,
    fontSize: 12,
    color: 'grey',
  },
})

function mapStateToProps(state) {
  return {
    dataSource: getListData(state.browsehistory.list || []),
    currentTabId: state.tabinfo.currentTabId,
  }
}

function mapDispatchToProps(dispatch) {
  return {
  }
}

function getListData(data) {
  console.log(JSON.stringify(data, null, 2));
  return dataSource.cloneWithRows(data);
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps)(BookBarPage);
