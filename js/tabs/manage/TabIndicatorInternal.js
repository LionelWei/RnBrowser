/* @flow */

import React, { Component, PropTypes} from 'react';
import {
  Text,
  TouchableHighlight,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Dimensions
} from 'react-native';

import {connect} from 'react-redux'
import {Emitter} from '../../events/Emitter'

import TabIndicatorItem from './TabIndicatorItem'

var {height, width} = Dimensions.get('window');

class TabIndicatorInternal extends Component {
  static propTypes = {
    dismiss: PropTypes.func.isRequired
  }
  tabViewList = []

  render() {
    this.refreshTabs();
    return (
      <TouchableWithoutFeedback
        onPress={() => {this.props.dismiss()}}>
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
              <TouchableOpacity onPress={this.addTab}>
                <Text key={'new'} style={{fontSize: 20}}>
                  新增标签
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  addTab = () => {
    this.props.dismiss()
    Emitter.emit('add_tab', 0)
  }

  switchTab(id) {
    console.log('Emitter.emit switch_tab: ' + id);
    this.props.dismiss()
    Emitter.emit('switch_tab', id)
  }

  closeTab(id) {
    console.log('tabindicator: _closeTab: ' + id);
    Emitter.emit('close_tab', id)
    this.props.dismiss()
  }

  refreshTabs = () => {
    if (!this.props.tabs) {
      return;
    }
    var count = this.props.tabs.length;
    console.log('tab count: ' + count);
    this.tabViewList = []

    // 这里要用`let`, 而不是`var`
    var j = 0;
    this.props.tabs
      .filter(elm => (elm != null))
      .forEach(elm => {
        let tabText = (++j) + ': ' + elm.title;
        let tabId = elm.id;
        console.log('=== id' + j + ' tabId: ' + tabId);
        this.tabViewList.push(
          <TabIndicatorItem
            key={tabId}
            switchTab={() => this.switchTab(tabId)}
            closeTab={() => this.closeTab(tabId)}
            tabText={tabText}/>
        )
      })
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'flex-end',
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
    tabs: state.tabinfo.tabs || []
  }
}

function mapDispatchToProps(dispatch) {
  return {
  }
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps)(TabIndicatorInternal)
