// @flow

import React, {PropTypes, Component } from 'react';
import {
  View,
  Image,
  Dimensions,
  Navigator,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback
} from 'react-native';

import {SCREEN_WIDTH} from '../../utils/Consts'
var ICON_WIDTH = SCREEN_WIDTH / 4

export default class WebsiteIcon extends Component {
  static propTypes = {
    pressFn: PropTypes.func.isRequired,
    icon: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
  }
  render() {
    return (
      <View style={styles.icon_container}>
        <TouchableOpacity onPress={() => this.props.pressFn()}>
          <Image style={styles.web_icon} source={this.props.icon}/>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  icon_container: {
    width: ICON_WIDTH,
    alignItems: 'center'
  },
  web_icon: {
    height: 40,
    width: 40,
  }
})
