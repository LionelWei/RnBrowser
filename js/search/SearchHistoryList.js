/* @flow */

import React, { Component, PropTypes } from 'react'

import {
  Image,
  View,
  Text,
  StyleSheet,
  ListView
} from 'react-native'

import {Emitter} from '../events/Emitter'

export default class extends Component {
  _ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
  _data = ['row1', 'row2'];
  state = {
    dataSource: this._ds.cloneWithRows(this._data),
  };

  constructor() {
    super();
    this._initData();
    this._initEvent();
  }

  render() {
    return (
      <ListView
        dataSource={this.state.dataSource}
        renderRow={(rowData) => <Text>{rowData}</Text>}
      />
    );
  }

  _initData() {
    this._ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });
  }

  _initEvent() {
    Emitter.addListener('url_changed', (...args) => {
      this._onDataArrived(args[0])
    })
  }

  _onDataArrived(url: string) {
    this._data = this._data.concat(url);
    this.setState({
      dataSource: this._ds.cloneWithRows(this._data)
    })
  }
}
