/* @flow */

import React, {PropTypes, Component } from 'react';
import { WebView } from 'react-native';

export default class Web extends Component {

  static propTypes = {
    url: PropTypes.string.isRequired
  };

  render() {
    return (
      <WebView
        source={{uri: this.props.url}}
      />
    );
  }
}
