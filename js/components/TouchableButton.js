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
import * as img from '../assets/imageAssets'


export default class TouchableButton extends Component {

  static propTypes = {
    enabled: PropTypes.bool,
    pressFn: PropTypes.func,
    normalBg: PropTypes.number,
    pressBg: PropTypes.number,
    disabledBg: PropTypes.number,
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
    console.log('button render....');
    let enabled = this.props.enabled;
    let disabledBg = this.props.disabledBg || this.props.pressBg;
    let settingBg = !enabled ? disabledBg : this.props.normalBg;
    let imgWidth = this.props.width || 20;
    let imgHeight = this.props.height || 20;
    let desc = this.props.description;
    return (
      <TouchableOpacity
        onPress={this.props.pressFn}>
        <View style={[styles.container, {
          width: imgWidth + 30,
          height: imgHeight + 30,
          backgroundColor: 'white'}]}>
          <Image
            style={{
              width: imgWidth,
              height: imgHeight
            }}
            source={settingBg}/>
          {desc
            ? <Text style={styles.descText}>{desc}</Text>
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
    fontSize: 12,
    color: 'black',
    textAlign: 'center'
  }
})
