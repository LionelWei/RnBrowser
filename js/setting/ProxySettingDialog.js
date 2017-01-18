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
import PopupDialog, {
  DialogTitle,
  DialogButton,
  SlideAnimation,
  ScaleAnimation,
  DefaultAnimation,
} from 'react-native-popup-dialog';

import {
  SCREEN_WIDTH
} from '../utils/Consts'

const defaultAnimation = new DefaultAnimation({ animationDuration: 150 });

class ProxySettingDialog extends Component {
  defaultAnimationDialog = {}

  open = () => {
    this.defaultAnimationDialog.openDialog()
  }
  render() {
    return (
      <PopupDialog
        ref={(defaultAnimationDialog) => {
          this.defaultAnimationDialog = defaultAnimationDialog;
        }}
        width={SCREEN_WIDTH - 40}
        dialogTitle={<DialogTitle title="免流量代理设置" />}
        dialogAnimation={defaultAnimation}
      >
        <View style={styles.dialogContentView}>
          <Item desc={'IP:'} />
          <Item desc={'端口号:'} />
          <Item desc={'用户名:'} />
          <Item desc={'密码:'} />
        </View>
      </PopupDialog>
    )
  }
}

class Item extends Component {
  render() {
    return (
      <View style={{height: 40}} >
        <View style={{flexDirection: 'row', alignItems: 'center'}} >
          <Text style={{fontSize: 16}}>
            {this.props.desc}
          </Text>
          <Text>
            haha
          </Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogContentView: {
    flex: 1,
    paddingTop: 20,
    paddingLeft: 10,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
});

module.exports = ProxySettingDialog;
