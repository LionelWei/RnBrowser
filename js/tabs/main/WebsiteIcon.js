// @flow

import React, {PropTypes, Component } from 'react';
import {
  View,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  PixelRatio
} from 'react-native';

import * as Consts from '../../utils/Consts'
const LEFT_MARGIN = 10;
const RIGHT_MARGIN = 10;
var ICON_WIDTH = (Consts.SCREEN_WIDTH - LEFT_MARGIN - RIGHT_MARGIN)/ 4;

export default class WebsiteIcon extends Component {
  static propTypes = {
    pressFn: PropTypes.func.isRequired,
    icon: PropTypes.number,
    desc: PropTypes.string,
    backgroundColor: PropTypes.string,
    borderColor: PropTypes.string,
  }
  render() {
    let containerWidth = 40;
    let imageWidth = 30;
    let hasBackground = !!this.props.backgroundColor;
    if (!hasBackground) {
      imageWidth = containerWidth;
    }
    let borderWidth = 0;
    if (this.props.borderColor) {
      borderWidth = 2 / PixelRatio.get();
    }
    return (
      <TouchableOpacity
        style={styles.icon_container}
        activeOpacity={0.6}
        onPress={() => this.props.pressFn()}>
        <View style={{flexDirection: 'column', alignItems: 'center'}}>
          <View style={[styles.icon_image_container, {
            backgroundColor: this.props.backgroundColor,
            borderColor: this.props.borderColor,
            borderWidth: borderWidth,
            borderRadius: 8,
            width: containerWidth,
            height: containerWidth,
            }]}>
            <Image
              style={{
                height: imageWidth,
                width: imageWidth,
                borderRadius: 8,
              }}
              source={this.props.icon}
              resizeMode={Image.resizeMode.contain}/>
          </View>
          <Text style={{paddingTop: 8, fontSize: Consts.spFont(12)}}>
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
    height: 80,
    marginBottom: 10,
    alignItems: 'center',
  },
  icon_image_container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
