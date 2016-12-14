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
} from 'react-native';
import { takeSnapshot } from "react-native-view-shot";
import {connect} from 'react-redux'

import TouchableButton from '../../components/TouchableButton'
import * as IMG from '../../assets/imageAssets'
import {showTabManager} from '../../reducers/tabmanage'
import {Emitter} from '../../events/Emitter'

import {NAV_BAR_HEIGHT, BOTTOM_BAR_HEIGHT} from '../../utils/Consts'
var {height: HEIGHT, width: WIDTH} = Dimensions.get('window');
var scaleDimension = {
  w: WIDTH * 0.8,
  h: (HEIGHT - NAV_BAR_HEIGHT - BOTTOM_BAR_HEIGHT) * 0.8,
}

class TabManageScreen extends Component {
  state: {
    dataSource: Array<String>
  }

  static propTypes = {
    uris: PropTypes.array.isRequired,
    navigator: PropTypes.object.isRequired,
    currentListIndex: PropTypes.number.isRequired,
  }

  state = {
    dataSource: this.props.uris
  }

  ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

  listView = {}

  constructor(props: any) {
    super(props)
  }

  componentWillReceiveProps(nextProps) {
    console.log('TabManageScreen, next uris: ' + nextProps.uris);
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   if (nextState.dataSource != this.state.dataSource) {
  //     return true;
  //   }
  //   return false
  // }

  componentDidMount() {
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
    return (
      <View style={styles.body}>
        {
          this.props.uris && this.props.uris.length > 0
          ? <ListView
              ref={(listview) => this.listView = listview}
              contentContainerStyle={{
                paddingLeft: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              horizontal={true}
              dataSource={this.ds.cloneWithRows(this.props.uris)}
              renderRow={(rowData, sectionID, rowID) => this.renderItem(rowData, sectionID, rowID)}
            />
          : null
        }
      </View>
    )
  }

  renderItem = (rowData, sectionID, rowID) => {
    console.log('sectionId: ' + sectionID + ', rowId: ' + rowID + ', tabId:  ' + this.props.tabs[rowID].id)

    return (
      <View style={{paddingLeft: 20}}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={()=> this.switchTab(rowID)}>
          <Image
            style={{
            width: scaleDimension.w,
            height: scaleDimension.h}}
            source={{uri: rowData}} />
        </TouchableOpacity>
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

  // 让当前tab显示在中间
  adjustPositionByCurrentWeb = () => {
    if (this.listView) {
      let offset = this.props.currentListIndex * scaleDimension.w * 1.1;
      this.listView.scrollTo(0, offset, false);
    }
  }

  add = () => {
    Emitter.emit('add_tab', 0)
    setTimeout(() => this.back(), 100)
  }

  back = () => {
    this.props.showTabManager(false);
    this.props.navigator.pop();
  }

  switchTab = (rowId: number) => {
    Emitter.emit('switch_tab', this.props.tabs[rowId].id)
    setTimeout(() => this.back(), 100)
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 10,
  }
})

function mapStateToProps(state) {
  return {
    tabs: state.tabinfo.tabs || [],
    uris: state.tabmanage.tabThumbUris
  }
}

function mapDispatchToProps(dispatch) {
  return {
    showTabManager: (visible) => {
      dispatch(showTabManager(visible))
    },
  }
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps)(TabManageScreen);
