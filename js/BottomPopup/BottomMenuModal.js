/* @flow */

import React, { Component, PropTypes} from 'react';
import {
  Modal,
  Text,
  TouchableHighlight,
  View,
  StyleSheet,
  TouchableWithoutFeedback
} from 'react-native';

import EventEmitter from 'EventEmitter'

import BottomPopupMenu from './BottomPopupMenu'
import {Emitter} from '../events/Emitter'

export default class BottomMenuModal extends Component {
  state = {
    modalVisible: false,
  }

  constructor() {
    super()
    Emitter.addListener('show_bottom_menu', (...args) => {
      var isVisible: bool = args[0];
      this.setModalVisible(isVisible)
    });
  }

  setModalVisible(visible: bool) {
    this.setState({modalVisible: visible});
  }

  render() {
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
                <BottomPopupMenu dismiss={() => {this.setModalVisible(false)}}/>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  menu_content: {
    height: 220,
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
})
