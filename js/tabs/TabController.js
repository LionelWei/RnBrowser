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
  InteractionManager,
  BackAndroid,
  findNodeHandle
} from 'react-native';
import {connect} from 'react-redux'
import {capture} from "../nativemodules/ViewCapture";

import {
  NAV_BAR_HEIGHT,
  BOTTOM_BAR_HEIGHT,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from '../utils/Consts'

import {Emitter} from '../events/Emitter'
import {printObj} from '../utils/Common'

import TabNavigator from './main/TabNavigator'
import TabManageScreen from './manage/TabManageScreen'
import TabBottomBar from './main/TabBottomBar'
import WebTitleBar from './web/WebTitleBar'
import WebBottomBar from './web/WebBottomBar'
import BottomMenuPopup from '../bottompopup/BottomMenuPopup'
import {createTab, removeTab, setFrontTab} from '../reducers/tabinfo'
import Transitions from '../animation/NavigatorAnimation'

class TabController extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
  }

  state = {
    tabList: [
      {
        id: 0,
        view: this.renderTab(0)
      }
    ],
    /*记录tab的个数, 目前是单调递增的, 即使删除一个tab再创建也会加1*/
    tabCount: 1,
    currentTabId: 0,
  }

  menuPopup = {};
  tabRefList = []
  uris = []

  constructor(props: any) {
    super(props);
    this.props.createTab(0)
    this.initEvent();
  }

  componentDidMount () {
    BackAndroid.addEventListener('hardwareBackPress', this.handleBack)
  }

  componentWillUnmount () {
    BackAndroid.removeEventListener('hardwareBackPress', this.handleBack)
  }

  componentWillReceiveProps(nextProps) {
  }

  render() {
    return (
      <View style={styles.container} >
        {this.renderOverlayBody()}
        {this.renderMenuPopup()}
      </View>
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

  renderMenuPopup = () => {
    return <BottomMenuPopup
            ref={(popup) => { this.menuPopup = popup;}}
            navigator={this.props.navigator}
           />
  }

  startTabManagerScreen = () => {
    let navigator = this.props.navigator
    let viewList = this.tabRefList.map(e => {
      return {
        tag: findNodeHandle(e),
        title: e.getTitleText()
      }
    })

    navigator.push({
      component: TabManageScreen,
      viewList: viewList,
      currentListIndex: this.findIndexByTabId(this.state.currentTabId),
      scene: Transitions.NONE,
    })
  }

  showCurrentTabAtFront() {
    var currentId: number = this.state.currentTabId;
    var excludeCurrentTabList =
      this.state.tabList.filter(e => {return e.id != currentId});
    return [...excludeCurrentTabList, this.findViewByTabId(currentId)];
  }

  findViewByTabId(tabId): any {
    let tab = null;
    this.state.tabList
        .forEach(e => {
          if (tabId === e.id) {
            tab = e;
          }
        })
    return tab;
  }

  findIndexByTabId(tabId: number): number {
    let findId = 0;
    this.state.tabList
          .forEach((e, i) => {
            if (tabId === e.id) {
              findId = i;
            }
          })
    return findId;
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
    this.props.createTab(primaryId);
    this.setState({
      tabList: [
        ...this.state.tabList,
        {
          id: primaryId,
          view: this.renderTab(primaryId)
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
    this.props.setFrontTab(id)
  }

  closeTab(id: number) {
    if (this.state.tabList.length == 1) {
      return;
    }
    this.props.removeTab(id);

    var tempList = this.state.tabList.slice();
    console.log('id: ' + id + ', tempList: ' + tempList.length);

    var currentId = this.state.currentTabId;
    var nearest = findNearestElement(tempList, id);
    var toDeleteId = this.findIndexByTabId(id)
    if (toDeleteId || toDeleteId === 0) {
      tempList.splice(toDeleteId, 1);
      this.tabRefList.splice(toDeleteId, 1);
    }

    this.setState({
      tabList: tempList,
      currentTabId: nearest
    })

    console.log('==== _closeWeb switchTab: ' + nearest);
    this.switchTab(nearest);

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

  renderTab(id: number) {
    return (
      <View key={id} style={styles.overlay}>
        <TabNavigator
          id={id}
          ref={(tab) => tab && this.tabRefList.push(tab)}
          menuPressFn={(isTabPage: bool) => this.menuPopup.open(isTabPage)}
          tabPressFn={()=>this.startTabManagerScreen()}
          />
      </View>
    )
  }

  handleBack = () => {
    if (this.menuPopup.isVisible()) {
      this.menuPopup.close()
      return true
    }

    const navigator = this.props.navigator
    const routers = navigator.getCurrentRoutes();
    if (routers.length > 1) {
      navigator.pop();
      return true;
    }

    let currentTab = this.tabRefList[this.state.currentTabId];
    return currentTab.back();
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
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
})

function mapStateToProps(state) {
  return {
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setFrontTab: (id: number) => {
      dispatch(setFrontTab(id))
    },
    createTab: (id: number) => {
      dispatch(createTab(id))
    },
    removeTab: (id: number) => {
      dispatch(removeTab(id))
    },
  }
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps)(TabController)
