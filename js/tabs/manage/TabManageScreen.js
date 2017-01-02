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
  NAV_BAR_HEIGHT,
  BOTTOM_BAR_HEIGHT,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from '../../utils/Consts'

var scaleDimension = {
  w: SCREEN_WIDTH * 0.8,
  h: (SCREEN_HEIGHT - NAV_BAR_HEIGHT - BOTTOM_BAR_HEIGHT) * 0.8,
}

class TabManageScreen extends Component {
  state: {
    dataSource: Array<String>
  }

  static propTypes = {
    viewList: PropTypes.array,
    navigator: PropTypes.object.isRequired,
    currentListIndex: PropTypes.number.isRequired,
  }

  state = {
    dataSource: this.props.viewList
  }

  ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

  listView = {}

  constructor(props: any) {
    super(props)
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.dataSource != this.state.dataSource) {
      return true;
    }
    return false
  }

  componentDidMount() {
    this.adjustPositionByCurrentIndex();
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
    let list = this.props.viewList;
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
    console.log('sectionId: ' + sectionID + ', rowId: '
                + rowID + ', tabId:  ' + this.props.tabs[rowID]
                + ', count: ' + this.props.tabs.length
                + ', viewTag: ' + this.props.viewList[rowID].tag)
    let viewData = this.props.viewList[rowID];
    let viewTag = viewData.tag;
    console.log('=== viewTag: ' + viewTag + ', screenWidth: ' + SCREEN_WIDTH
                + ', screenHeight: ' + SCREEN_HEIGHT);
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
        }}>
          {viewData.title}
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={()=> this.switchTab(rowID)}>
          <CaptureView
            style={{
              width: scaleDimension.w,
              height: scaleDimension.h}}
            tagWithRect={{
              tag: viewTag,
              x: 0,
              y: PixelRatio.getPixelSizeForLayoutSize(NAV_BAR_HEIGHT),
              w: PixelRatio.getPixelSizeForLayoutSize(SCREEN_WIDTH),
              h: PixelRatio.getPixelSizeForLayoutSize(SCREEN_HEIGHT-NAV_BAR_HEIGHT-BOTTOM_BAR_HEIGHT),
            }}/>
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
                flex:1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Image style={{
                width: 30,
                height: 30,
                }} source={IMG.ICON_CLOSE_NORMAL}/>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  renderBottomBar = () => {
    return (
      <View style={styles.bottombar}>
        <TouchableButton
          pressFn = {this.add}
          normalBg = {IMG.ICON_NEW_ADD_NORMAL}
          pressBg = {IMG.ICON_NEW_ADD_PRESSED} />
        <TouchableButton
          pressFn = {this.back}
          normalBg = {IMG.ICON_BACK_NORMAL}
          pressBg = {IMG.ICON_BACK_PRESSED} />
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
    Emitter.emit('add_tab', 0)
    setTimeout(() => this.back(), 100)
  }

  back = () => {
    this.props.navigator.pop();
  }

  switchTab = (rowId: number) => {
    console.log('=== switch To tab: ' + this.props.tabs[rowId] + ', rowId: ' + rowId);
    Emitter.emit('switch_tab', this.props.tabs[rowId])
    this.back();
    // setTimeout(() => this.back(), 100)
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
      console.log('===== TabManageScreen closeTab: ' + tabId);
      Emitter.emit('close_tab', tabId);
    }
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
  mapDispatchToProps)(TabManageScreen);
