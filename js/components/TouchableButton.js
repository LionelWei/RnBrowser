/* @flow */

import React, {PropTypes, Component } from 'react'

import {
  Image,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native'
import * as Consts from '../utils/Consts'

export default class TouchableButton extends Component {

  static propTypes = {
    enabled: PropTypes.bool,
    pressFn: PropTypes.func,
    normalBg: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    description: PropTypes.string
  };

  static defaultProps = {
    enabled: true
  }

  constructor() {
    super()
  }

  render() {
    let enabled = this.props.enabled;
    let settingBg = this.props.normalBg;
    let opacity = enabled ? 1 : 0.5;
    let imgWidth = this.props.width || 20;
    let imgHeight = this.props.height || 20;
    let desc = this.props.description;

    let containerWidth = imgWidth + 28;
    let containerHeight = imgHeight + 20;
    if (desc && desc.length > 0) {
      containerWidth += 20;
      containerHeight += 10;
    }
    return (
      <TouchableOpacity
        disabled={!enabled}
        onPress={this.props.pressFn}
        onLongPress={this.props.longPressFn}>
        <View style={[styles.container, {
          width: containerWidth,
          height: containerHeight,
          backgroundColor: 'transparent'}]}>
          <Image
            style={{
              width: imgWidth,
              height: imgHeight
            }}
            source={settingBg}
            opacity={opacity}/>
          {desc
            ? <Text style={[styles.descText, {
                opacity: opacity
              }]}>{desc}</Text>
            : null}
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  descText: {
    paddingTop: 4,
    fontSize: Consts.spFont(12),
    color: 'black',
    textAlign: 'center'
  }
})
