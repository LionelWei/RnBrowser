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
    console.log('button render.... source: ' + this.props.normalBg);
    let enabled = this.props.enabled;
    let settingBg = this.props.normalBg;
    let opacity = enabled ? 1 : 0.5;
    let imgWidth = this.props.width || 20;
    let imgHeight = this.props.height || 20;
    let desc = this.props.description;
    return (
      <TouchableOpacity
        disabled={!enabled}
        onPress={this.props.pressFn}>
        <View style={[styles.container, {
          width: imgWidth + 20,
          height: imgHeight + 20,
          backgroundColor: 'white'}]}>
          <Image
            style={{
              width: imgWidth,
              height: imgHeight
            }}
            source={settingBg}
            opacity={opacity}/>
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
