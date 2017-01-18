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
  PixelRatio,
} from 'react-native';

import {connect} from 'react-redux'
import TouchableButton from '../../components/TouchableButton'
import * as IMG from '../../assets/imageAssets'
import {Emitter} from '../../events/Emitter'
import CaptureView from '../../nativemodules/CaptureView'


import {
  isIOS,
  NAV_BAR_HEIGHT,
  BOTTOM_BAR_HEIGHT,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  STATUS_BAR_HEIGHT,
} from '../../utils/Consts'

const TOP_OFFSET = isIOS ? NAV_BAR_HEIGHT + STATUS_BAR_HEIGHT : NAV_BAR_HEIGHT;
const BOTTOM_OFFSET = BOTTOM_BAR_HEIGHT;

var scaleDimension = {
  w: SCREEN_WIDTH * 0.8,
  h: (SCREEN_HEIGHT - NAV_BAR_HEIGHT - BOTTOM_BAR_HEIGHT) * 0.8,
}

class TabManagePage extends Component {
  static propTypes = {
    viewList: PropTypes.array,
    navigator: PropTypes.object.isRequired,
    currentListIndex: PropTypes.number.isRequired,
    onAppendTab: PropTypes.func.isRequired,
    onSwitchTab: PropTypes.func.isRequired,
    onCloseTab: PropTypes.func.isRequired,
  }

  state = {
    dataSource: this.props.viewList
  }

  ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
  listView = {}
  isDataLoaded = false;
  timer = {}

  constructor(props: any) {
    super(props)
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log(JSON.stringify(nextState, null, 2));
    if (nextState.dataSource !== this.state.dataSource) {
      console.log('tab manager true');
      return true;
    }
    console.log('tab manager false');
    return false
  }

  componentDidMount() {
    this.timer = setTimeout(() => {
      if (!this.isDataLoaded) {
        this.isDataLoaded = true;
        this.forceUpdate()
      }
    }, 0)
    // this.adjustPositionByCurrentIndex();
  }

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
  }

  render() {
    return (
      <View style={styles.container}>
        {this.renderBody()}
        {this.renderBottomBar()}
      </View>
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

  renderItem = (rowData, sectionID, rowID) => {
    let viewData = this.props.viewList[rowID];
    let viewTag = viewData.tag;
    // console.log(JSON.stringify(viewData, null, 2));
    return (
      <View style={{
        flexDirection: 'column',
        paddingLeft: 10,
        paddingRight: 10}}>
        <Text style={{
          fontSize: 16,
          color: 'black',
          marginLeft: 2,
          marginBottom: 4,
          width: scaleDimension.w,}}
          numberOfLines={1}>
          {viewData.title}
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
      !this.isDataLoaded
      ? <View style={{width: w, height: h}} />
      : <CaptureView
          style={{
            width: scaleDimension.w,
            height: scaleDimension.h}}
          tagWithRect={{
            tag: viewTag,
            x: 0,
            y: TOP_OFFSET,
            w: SCREEN_WIDTH,
            h: SCREEN_HEIGHT - TOP_OFFSET - BOTTOM_OFFSET,
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
          pressFn = {this.back}
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
    this.back()
  }

  switchTab = (rowId: number) => {
    console.log('=== switch To tab: ' + this.props.tabs[rowId] + ', rowId: ' + rowId);
    let id = this.props.tabs[rowId];
    this.props.onSwitchTab && this.props.onSwitchTab(id)
    this.back();
  }

  closeTab = (rowId: number) => {
    let tabId = this.props.tabs[rowId];
    if (this.state.dataSource.length === 1) {
      this.back()
    } else {
      let newDataSource = this.state.dataSource.slice()
      newDataSource.splice(rowId, 1)
      this.setState({
        dataSource: newDataSource
      })
      console.log('===== TabManagePage closeTab: ' + tabId);
      this.props.onCloseTab && this.props.onCloseTab(tabId)
    }
  }

  back = () => {
    this.props.navigator.pop();
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'whitesmoke',
  },

  bottombar: {
    height: BOTTOM_BAR_HEIGHT,
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  body: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  }
})

function mapStateToProps(state) {
  return {
    tabs: state.tabinfo.tabIds || [],
  }
}

function mapDispatchToProps(dispatch) {
  return {
  }
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps)(TabManagePage);
