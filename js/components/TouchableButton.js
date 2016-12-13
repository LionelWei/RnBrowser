/* @flow */

import React, {PropTypes, Component } from 'react'

import {
  Image,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback
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

  state = {
    isButtonPressing: false
  }

  constructor() {
    super()
  }

  render() {
    let enabled = this.props.enabled;
    let isPressing = this.state.isButtonPressing;
    let disabledBg = this.props.disabledBg || this.props.pressBg;
    let settingBg = !enabled
                    ? this.props.pressBg
                    : (isPressing ? this.props.pressBg : this.props.normalBg)
    let imgWidth = this.props.width || 20;
    let imgHeight = this.props.height || 20;
    let desc = this.props.description;
    return (
      <TouchableWithoutFeedback
        disabled = {!this.props.enabled}
        onPress={this.props.pressFn}
        onPressIn = {() => this.onTouchDown()}
        onPressOut = {() => this.onTouchUp()}>
        <View style={styles.container}>
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
      </TouchableWithoutFeedback>
    )
  }

  onTouchDown() {
    this.setState({
      isButtonPressing: true
    })

  }

  onTouchUp() {
    this.setState({
      isButtonPressing: false
    })
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center'
  },
  descText: {
    paddingTop: 4,
    fontSize: 12,
    color: 'black',
    textAlign: 'center'
  }
})
