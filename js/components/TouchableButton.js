/* @flow */

import React, {PropTypes, Component } from 'react'

import {
  Image,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback
} from 'react-native'


export default class TouchableButton extends Component {

  static propTypes = {
    pressFn: PropTypes.func,
    normalBg: PropTypes.string.isRequired,
    pressBg: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    description: PropTypes.string
  };

  state = {
    isButtonPressing: false
  }

  constructor() {
    super()
  }


  render() {
    let isPressing = this.state.isButtonPressing
    let settingBg = isPressing ? this.props.pressBg : this.props.normalBg
    let imgWidth = this.props.width ? this.props.width : 20;
    let imgHeight = this.props.height ? this.props.height : 20;
    let desc = this.props.description;
    return (
      <TouchableWithoutFeedback
        onPress={this.props.pressFn}
        onPressIn = {() => this.onTouchDown()}
        onPressOut = {() => this.onTouchUp()}>
        <View style={styles.container}>
          <Image
            style={{
              width: imgWidth,
              height: imgHeight
            }}
            source={{uri: settingBg}}/>
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
