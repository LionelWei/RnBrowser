/* @flow */

import React, { Component, PropTypes} from 'react';
import { Modal, Text, TouchableHighlight, View } from 'react-native';

export default class BottomMenuModal extends Component {
  static propTypes = {
    visible: PropTypes.bool
  };

  state = {
    modalVisible: false,
  }

  constructor() {
    super()
  }

  componentWillReceiveProps(props) {
    console.log('visible: ' + props.visible);
    this.setModalVisible(this.props.visible)
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
        onRequestClose={() => {alert("Modal has been closed.")}}
        >
       <View style={{marginTop: 22}}>
        <View>
          <Text>Hello World!</Text>

          <TouchableHighlight onPress={() => {
            this.setModalVisible(!this.state.modalVisible)
          }}>
            <Text>Hide Modal</Text>
          </TouchableHighlight>

        </View>
       </View>
      </Modal>
    );
  }
}
