import React, { Component, PropTypes} from 'react';
import {
  Modal,
  Text,
  TouchableHighlight,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity
} from 'react-native';


class TabIndicatorItem extends Component {
  static propTypes = {
    id: PropTypes.number,
    switchTab: PropTypes.func,
    closeTab: PropTypes.func,
    tabText: PropTypes.string,
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          key={this.props.id}
          onPress={() => this.props.switchTab(this.props.id)}>
          <Text>
            {this.props.tabText}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          key={this.props.id}
          onPress={() => this.props.closeTab(this.props.id)}>
          <Text>
            关闭
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row'
  },

})
module.exports = TabIndicatorItem
