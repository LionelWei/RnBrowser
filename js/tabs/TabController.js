/*
 * @flow */

import React, {PropTypes, Component } from 'react';
import {
  WebView,
  View,
  Text,
  Dimensions,
  StyleSheet,
  Navigator,
} from 'react-native';
import {connect} from 'react-redux'
import { takeSnapshot } from "react-native-view-shot";
import {NAV_BAR_HEIGHT ,BOTTOM_BAR_HEIGHT} from '../utils/Consts'

var {height: HEIGHT, width: WIDTH} = Dimensions.get('window');

import {Emitter} from '../events/Emitter'
import {printObj} from '../utils/Common'

import TabNavigator from './main/TabNavigator'
import TabManageScreen from './manage/TabManageScreen'
import TabBottomBar from './main/TabBottomBar'
import WebTitleBar from './web/WebTitleBar'
import WebBottomBar from './web/WebBottomBar'
import BottomMenuPopup from '../bottompopup/BottomMenuPopup'
import {showTabManager} from '../reducers/tabmanage'
import {BottomToTop} from '../animation/NavigatorAnimation'

class TabController extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
  }

  state = {
    tabList: [
      {
        id: 0,
        view: this.renderTab(0, 0)
      }
    ],
    /*记录tab的个数, 目前是单调递增的, 即使删除一个tab再创建也会加1*/
    tabCount: 1,
    currentTabId: 0,
  }

  menuPopup = {};
  tabRefList = []

  constructor(props: any) {
    super(props);
    this.initEvent();
  }

  componentWillReceiveProps(nextProps) {
    setTimeout(() => {
      if (nextProps.isTabManagerVisible) {
        this.startTabManagerScreen(true)
      }
    }, 400)
  }

  // 如果要支持下滑时自动隐藏标题栏和底栏的话, 可以考虑把titlebar和bottombar的布局
  // 设为'absolute'
  render() {
    return (
      <View style={styles.container} >
        {this.renderTitleBar()}
        {this.renderSpaceHoler()}
        {this.renderBottomBar()}
        {this.renderOverlayBody()}
        {this.renderMenuPopup()}
      </View>
    )
  }

  renderTitleBar = () => {
    console.log('isCurrentTabPage: ' + this.props.isCurrentTabPage);
    return <WebTitleBar
            navigator={this.props.navigator}/>
  }

  // 只是为了占位
  renderSpaceHoler = () => {
    let offset = BOTTOM_BAR_HEIGHT + NAV_BAR_HEIGHT;
    return (
      <View style={{height: HEIGHT - offset}} / >
    )
  }

  renderOverlayBody = () => {
    let newTabList = this.showCurrentTabAtFront();
    return (
      newTabList.map((elem, index) => {
        return elem.view;
      })
    )
  }

  renderBottomBar = () => {
    return this.props.isCurrentTabPage
          ? <TabBottomBar
              menuPressFn={() => this.menuPopup.open()}
              tabPressFn={() => this.startTabManagerScreen(true)}/>
          : <WebBottomBar
              menuPressFn={() => this.menuPopup.open()}
              tabPressFn={() => this.startTabManagerScreen(true)}
              homePressFn={() => this.goToHome(this.state.currentTabId)}/>
  }

  renderMenuPopup = () => {
    return <BottomMenuPopup
              ref={(popup) => { this.menuPopup = popup;}}/>
  }

  startTabManagerScreen = (visible) => {
    if (!visible) {
      return;
    }

    let navigator = this.props.navigator

    var promises = [...this.tabRefList].map(ref => {
      return takeSnapshot(ref, {
        quality: 0.8,
      })
    })
    Promise.all(promises).then(
      uris => {
        console.log('uris: ' + uris.toString());
        navigator.push({
          component: TabManageScreen,
          dataSource: uris,
          currentListIndex: this.findIndexByTabId(this.state.currentTabId),
          scene: BottomToTop,
        })
      },
      error => console.error("Oops, snapshot failed", error)
    )
  }

  showCurrentTabAtFront() {
    var currentId: number = this.state.currentTabId;
    var excludeCurrentTabList = this.state.tabList.filter((elm, index) => {
      return elm.id != currentId;
    });
    return [...excludeCurrentTabList, this.findViewByTabId(currentId)];
  }

  findViewByTabId(tabId): any {
    for (var i in this.state.tabList) {
      if (tabId === this.state.tabList[i].id) {
        return this.state.tabList[i]
      }
    }
  }

  findIndexByTabId(tabId: number): number {
    for (var i in this.state.tabList) {
      if (tabId === this.state.tabList[i].id) {
        return i;
      }
    }
    return 0;
  }

  initEvent() {
    Emitter.addListener('add_tab', (...args) => {
      this.appendTab();
    })

    Emitter.addListener('switch_tab', (...args) => {
      var id = args[0];
      this.switchTab(id);
    })

    Emitter.addListener('close_tab', (...args) => {
      var id = args[0];
      this.closeTab(id);
    })
  }

  appendTab() {
    var primaryId = this.state.tabCount;
    this.setState({
      tabList: [
        ...this.state.tabList,
        {
          id: primaryId,
          view: this.renderTab(primaryId, primaryId)
        }
      ],
      tabCount: this.state.tabCount + 1,
      currentTabId: primaryId
    })
  }

  switchTab(id: number) {
    this.setState({
      currentTabId: id
    })
  }

  closeTab(id: number) {
    if (this.state.tabList.length == 1) {
      return;
    }

    var tempList = this.state.tabList.slice();
    console.log('id: ' + id + ', tempList: ' + tempList.length);

    var currentId = this.state.currentTabId;
    var nearest = findNearestElement(tempList, id);
    var toDeleteId = this.findIndexByTabId(id)
    if (toDeleteId || toDeleteId === 0) {
      console.log('toDeleteId ' + toDeleteId);
      tempList.splice(toDeleteId, 1);
    }

    this.setState({
      tabList: tempList,
      currentTabId: nearest
    })

    console.log('==== _closeWeb switchTab: ' + nearest);
    Emitter.emit('switch_tab', nearest);

    function findNearestElement(arr: Array<Object>, id: number) {
      var prevList = arr.filter(e => e.id <= id);
      if (prevList.length > 1) {
        return prevList[0].id
      }
      var nextList = arr.filter(e => e.id >= id);
      if (nextList.length > 1) {
        return nextList[1].id
      }
      return id;
    }

  }

  renderTab(id: number, key: any) {
    return (
      <View key={key} style={styles.overlay}>
        <TabNavigator
          id={id}
          key={id}
          ref={(tab) => this.tabRefList.push(tab)}/>
      </View>
    )
  }

  goToHome(tabId: number) {
    let index: number = this.findIndexByTabId(tabId);
    this.tabRefList[index].popToMain();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'transparent',
  },
  overlay:{
    position: 'absolute',
    top: NAV_BAR_HEIGHT,
    left: 0,
    width: WIDTH,
    height: HEIGHT - NAV_BAR_HEIGHT - BOTTOM_BAR_HEIGHT,
  },
})

function mapStateToProps(state) {
  return {
    isTabManagerVisible: state.tabmanage.showManager,
    isCurrentTabPage: state.tabinfo.isTabPageVisible,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    showTabManager: (visible: bool) => {
      dispatch(showTabManager(visible))
    }
  }
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps)(TabController)
