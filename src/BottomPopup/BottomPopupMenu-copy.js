/* @flow */

import React, { Component, PropTypes } from 'react'

import {
  Image,
  View,
  Text,
  StyleSheet,
  TextInput,
  Dimensions
} from 'react-native'

import TouchableButton from '../components/TouchableButton'
import {BOTTOM_BAR_HEIGHT} from '../utils/Consts'
import ViewPager from 'react-native-viewpager'

var deviceWidth = Dimensions.get('window').width;

const style = StyleSheet.create({
  basic: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'transparent'
  },
  menu_content: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
  },
  menu_bottom: {
    height: BOTTOM_BAR_HEIGHT,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  page: {
    width: deviceWidth,
  },
})

var IMGS = [
  'icon_unfavor_normal',
  'icon_unfavor_pressed'
]

export default class BottomPopupMenu extends Component {
  static propTypes = {
    dismiss: PropTypes.func.isRequired
  };

  state = {
    dataSource: this._getDataSource()
  }

  render() {
    return (
      <View style={style.basic}>
        <ViewPager
          dataSource={this.state.dataSource}
          renderPage={this._renderPage}
          locked={false}/>
        <View style={style.menu_bottom}>
          <TouchableButton
            pressFn = {() => alert('关于')}
            normalBg = 'icon_about_normal'
            pressBg = 'icon_about_pressed' />

          <TouchableButton
            pressFn = {() => {this.props.dismiss()}}
            normalBg = 'icon_fold_normal'
            pressBg = 'icon_fold_pressed' />

          <TouchableButton
            pressFn = {()=>alert('分享')}
            normalBg = 'icon_share_normal'
            pressBg = 'icon_share_pressed' />
        </View>
      </View>
    )
  }

  _getDataSource() {
    var dataSource = new ViewPager.DataSource({
      pageHasChanged: (p1, p2) => p1 !== p2,
    });
    return dataSource.cloneWithPages(IMGS)
  }

  _renderPage (data: Object, pageID: number | string,) {
    return (
      <Image
        source={{uri: data}}
        style={style.page} />
    );
  }

}
