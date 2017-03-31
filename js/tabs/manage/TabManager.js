// @flow

import React, {PropTypes, Component } from 'react';
import {
  WebView,
  View,
  Text,
  Dimensions,
  Image,
  StyleSheet,
  ListView,
  TouchableOpacity,
  Animated,
} from 'react-native';

import {connect} from 'react-redux'
import TouchableButton from '../../components/TouchableButton'
import * as IMG from '../../assets/imageAssets'
import {Emitter} from '../../events/Emitter'
import CaptureView from '../../nativemodules/CaptureView'


import * as Consts from '../../utils/Consts'
const TOP_MARGIN = Consts.isIOS ? Consts.SEARCH_BAR_HEIGHT + Consts.STATUS_BAR_HEIGHT : Consts.SEARCH_BAR_HEIGHT;
const BOTTOM_MARGIN = Consts.BOTTOM_BAR_HEIGHT;

var scaleDimension = {
  w: Consts.SCREEN_WIDTH * 0.8,
  h: (Consts.SCREEN_HEIGHT - Consts.SEARCH_BAR_HEIGHT - Consts.BOTTOM_BAR_HEIGHT) * 0.8,
}

class TabManager extends Component {
  static propTypes = {
    onAppendTab: PropTypes.func.isRequired,
    onSwitchTab: PropTypes.func.isRequired,
    onCloseTab: PropTypes.func.isRequired,
  }

  state = {
    dataSource: [],
    currentListIndex: 0,
    tabs: [],
    animatedValue: new Animated.Value(0),
  }

  ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
  listView = {}
  container = {};
  visible = false;

  isVisible = () => {
    return this.visible;
  }

  showWithNewData = (data: Object) => {
    let {viewList, currentListIndex, tabs} = data;
    this.setState({
      dataSource: viewList,
      currentListIndex: currentListIndex,
      tabs: tabs,
    })
    Animated.spring(
      this.state.animatedValue, {
        toValue: 1,
        bounciness: 0,
        speed: 20,
      }
    ).start(() => {});
    this.visible = true;
  }

  hide = (animated: bool = false) => {
    this.visible = false;
    if (animated) {
      Animated.spring(
        this.state.animatedValue, {
          toValue: 0,
          bounciness: 0,
          speed: 20,
        }
      ).start(() => {
        this.setState({
          dataSource: []
        });
      });
    } else {
      this.state.animatedValue.setValue(0);
      setTimeout(() => {
        this.setState({
          dataSource: []
        });
      }, 50);
    }
    this.props.onHide && this.props.onHide();
  }

  shouldComponentUpdate(nextProps: Object, nextState: Object) {
    if (nextState.dataSource !== this.state.dataSource
      || nextState.dataSource.length !== this.state.dataSource.length
      || nextState.currentListIndex !== this.state.currentListIndex) {
      return true;
    }
    return false
  }

  componentDidMount() {
    // this.adjustPositionByCurrentIndex();
  }

  componentWillUnmount() {
  }

  render() {
    return (
      <Animated.View
        ref={(view) => this.container = view}
        style={[styles.container, {
          height: this.state.animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, Consts.SCREEN_HEIGHT]
          }),
          transform: [{
            translateY: this.state.animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [Consts.SCREEN_HEIGHT , 0]
            })
          }]
        }]}>
        {this.renderBody()}
        {this.renderBottomBar()}
      </Animated.View>
    )
  }

  renderBody = () => {
    let list = this.state.dataSource;
    console.log('==== list length: ' + list.length);
    return (
      <View style={styles.body}>
        <ListView
          ref={(listview) => this.listView = listview}
          contentContainerStyle={{
            alignItems: 'center',
            justifyContent: 'center',
          }}
          horizontal={true}
          dataSource={this.ds.cloneWithRows(list)}
          renderRow={(rowData, sectionID, rowID) => this.renderItem(rowData, sectionID, rowID)}
        />
      </View>
    )
  }

  renderItem = (rowData: any, sectionID: any, rowID: any) => {
    let viewTag = rowData.tag;
    console.log(JSON.stringify(rowData, null, 2));
    console.log('viewTag: ' + viewTag);
    return (
      <View style={{
        flexDirection: 'column',
        marginLeft: 10,
        marginRight: 10,}}>
        <Text style={{
          fontSize: Consts.spFont(16),
          color: 'black',
          marginLeft: 2,
          marginBottom: 4,
          width: scaleDimension.w,}}
          numberOfLines={1}>
          {rowData.title}
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={()=> this.switchTab(rowID)}>
          {this.renderThumbView(viewTag)}
        </TouchableOpacity>

        <View style={{
          width: scaleDimension.w,
          height: 40,
          bottom: 0,
          position: 'absolute',
        }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => this.closeTab(rowID)}>
            <View
              style={{
                width: scaleDimension.w,
                height: 40,
                backgroundColor: '#000000aa',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Image style={{
                width: 30,
                height: 30,
                }} source={IMG.ICON_CLOSE_LIGHT_NORMAL}/>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  renderThumbView = (viewTag: number) => {
    let w = scaleDimension.w
    let h = scaleDimension.h
    return (
      <CaptureView
        style={{
          width: w,
          height: h}}
        tagWithRect={{
          tag: viewTag,
          x: 0,
          y: TOP_MARGIN,
          w: Consts.SCREEN_WIDTH,
          h: Consts.SCREEN_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN,
        }}/>
    )

  }

  renderBottomBar = () => {
    return (
      <View style={styles.bottombar}>
        <TouchableButton
          pressFn = {this.add}
          normalBg = {IMG.ICON_ADD_NORMAL} />
        <TouchableButton
          pressFn = {() => this.hide()}
          normalBg = {IMG.ICON_BACK_NORMAL}/>
      </View>
    )
  }

  // TODO 不起作用
  // 让当前tab显示在中间
  adjustPositionByCurrentIndex = () => {
    if (this.listView) {
      let offset = this.props.currentListIndex * scaleDimension.w * 1.1;
      console.log('==== offset: ' + offset);
      this.listView.scrollTo({x: offset, y: offset, animated: false});
    }
  }

  add = () => {
    this.props.onAppendTab && this.props.onAppendTab()
    this.hide();
    // setTimeout(() => {
    // }, 0);
    // this.hide();
  }

  switchTab = (rowId: number) => {
    console.log('=== switch To tab: ' + this.state.tabs[rowId] + ', rowId: ' + rowId);
    let id = this.state.tabs[rowId];
    this.props.onSwitchTab && this.props.onSwitchTab(id)
    this.hide();
  }

  closeTab = (rowId: number) => {
    let tabId = this.state.tabs[rowId];
    if (this.state.dataSource.length === 1) {
      this.hide();
      this.props.onCloseTab && this.props.onCloseTab(tabId);
    } else {
      console.log('old: ' + JSON.stringify(this.state.dataSource, null, 2));
      console.log('rowId: ' + rowId);
      let newDataSource = this.state.dataSource.slice()
      newDataSource.splice(rowId, 1)
      console.log('new: ' + JSON.stringify(newDataSource, null, 2));
      this.setState({
        dataSource: newDataSource
      })
      console.log('===== TabManager closeTab: ' + tabId);
      setTimeout(() => {
        this.props.onCloseTab && this.props.onCloseTab(tabId)
      }, 100);
    }
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: 'whitesmoke',
    top: Consts.TOP_OFFSET,
    left: 0,
    width: Consts.SCREEN_WIDTH,
    height: Consts.SCREEN_HEIGHT,
  },
  body: {
    position: 'relative',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },

  bottombar: {
    position: 'relative',
    height: Consts.BOTTOM_BAR_HEIGHT,
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
})

module.exports = TabManager;
