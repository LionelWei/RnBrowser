// @flow

import React, {PropTypes, Component } from 'react';
import {
  View,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  TouchableWithoutFeedback
} from 'react-native';

import {SCREEN_WIDTH} from '../../utils/Consts'
var ICON_WIDTH = SCREEN_WIDTH / 4

export default class WebsiteIcon extends Component {
  static propTypes = {
    pressFn: PropTypes.func.isRequired,
    icon: PropTypes.number,
    desc: PropTypes.string,
  }
  render() {
    return (
      <TouchableOpacity
        style={styles.icon_container}
        onPress={() => this.props.pressFn()}>
        <View style={{flexDirection: 'column', alignItems: 'center'}}>
          <Image
            style={styles.web_icon}
            source={this.props.icon}
            resizeMode={Image.resizeMode.contain}/>
          <Text style={{paddingTop: 4, fontSize: 12}}>
            {this.props.desc}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  icon_container: {
    width: ICON_WIDTH,
    height: 100,
    alignItems: 'center'
  },
  web_icon: {
    height: 50,
    width: 50,
  }
})
