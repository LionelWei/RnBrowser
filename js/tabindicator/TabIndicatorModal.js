/* @flow */

import React, { Component, PropTypes} from 'react';
import {
  Modal,
  Text,
  TouchableHighlight,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity
} from 'react-native';

import {connect} from 'react-redux'
import EventEmitter from 'EventEmitter'
import {Emitter} from '../events/Emitter'

import TabIndicatorItem from './TabIndicatorItem'

class TabIndicatorModal extends Component {
  state = {
    modalVisible: false,
  }

  constructor() {
    super()
    Emitter.addListener('show_tab_indicator', (...args) => {
      var isVisible: bool = args[0];
      this.setModalVisible(isVisible)
    });
  }

  setModalVisible(visible: bool) {
    this.setState({modalVisible: visible});
  }

  tabViewList = []

  render() {
    this._refreshTabs();
    return (
      <Modal
        animationType={"none"}
        transparent={true}
        visible={this.state.modalVisible}
        onRequestClose={() => {this.setModalVisible(false)}}>
        <TouchableWithoutFeedback
          onPress={() => {this.setModalVisible(false)}}>
          <View style={{
              flex: 1
            }}>
            <View style={{
              flex: 1,
              backgroundColor: 'black',
              opacity: 0.2
            }}/>
            <View style={styles.container}>
              <View style={styles.menu_content}>
                {this.tabViewList}
                <TouchableOpacity onPress={this._addTab}>
                  <Text key={'new'} style={{fontSize: 20}}>
                    新增标签
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }

  _addTab = () => {
    this.setModalVisible(false)
    Emitter.emit('add_tab', 0)
  }

  _switchTab(id) {
    console.log('Emitter.emit switch_tab: ' + id);
    this.setModalVisible(false)
    Emitter.emit('switch_tab', id)
  }

  _closeTab(id) {
    this.setModalVisible(false)
    Emitter.emit('close_tab', id)
  }

  _refreshTabs = () => {
    if (!this.props.tabs) {
      return;
    }
    var count = this.props.tabs.length;
    console.log('tab count: ' + count);
    this.tabViewList = []

    // 这里要用`let`, 而不是`var`
    for (let i = 0; i < count; i++) {
      let tabText = (i + 1) + ': ' + this.props.tabs[i].title;
      let tabId = this.props.tabs[i].id;
      console.log('=== id' + i + ' tabId: ' + tabId);
      this.tabViewList.push(
        <TabIndicatorItem
          key={i}
          switchTab={() => this._switchTab(tabId)}
          closeTab={() => this._closeTab(tabId)}
          tabText={tabText}/>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 50
  },
  menu_content: {
    height: 220,
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
})

function mapStateToProps(state) {
  return {
    tabs: state.webtabs.tabs || []
  }
}

function mapDispatchToProps(dispatch) {
  return {
  }
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps)(TabIndicatorModal)
