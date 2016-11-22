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

import BottomPopupMenu from '../BottomPopup/BottomPopupMenu'
import {Emitter} from '../events/Emitter'

export default class BottomMenuModal extends Component {
  state = {
    modalVisible: false,
  }

  constructor() {
    super()
    Emitter.addListener('show_bottom_bar', (...args) => {
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
        animationType={"slide"}
        transparent={true}
        visible={this.state.modalVisible}
        onRequestClose={() => {this.props.pressFn()}}
        >
        <TouchableWithoutFeedback
          onPress={() => {this.setModalVisible(false)}}>
          <View style={styles.container}>
            <View style={{
              height: 200,
              backgroundColor: 'white',
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-around'
            }}>
              <BottomPopupMenu dismiss={() => {this.setModalVisible(false)}}/>
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  flexCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal: {
    backgroundColor: 'rgba(0,0,0,.8)',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  }
})
