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
        <TouchableOpacity style={{
          flex: 1,
          backgroundColor: '#ddd',
          alignItems: 'center'}}
          key={this.props.id}
          onPress={() => this.props.switchTab(this.props.id)}>
          <Text style={styles.tabDesc}>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabDesc: {
    fontSize: 16,
  },


})
module.exports = TabIndicatorItem
