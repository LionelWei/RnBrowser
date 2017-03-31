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
  findNodeHandle,
} from 'react-native';
import {connect} from 'react-redux'

import {
  isIOS,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  TOP_OFFSET,
} from '../utils/Consts'

import {Emitter} from '../events/Emitter'

import TabNavigator from './TabNavigator'
import TabManager from './manage/TabManager'
import BottomMenuPopup from '../components/BottomMenuPopup'
import {createTab, removeTab, resetTab} from '../reducers/tabinfo'
import Transitions from '../animation/NavigatorAnimation'
import DownloadManagerPage from '../download/DownloadManagerPage'
import HistoryPage from '../history/HistoryPage'
import SettingPage from '../setting/SettingPage'
import ProxySettingPage from '../setting/ProxySettingPage'

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
    currentTabId: 0,
  }
  /*记录tab的个数, 目前是单调递增的, 即使删除一个tab再创建也会加1*/
  tabIncreaseIndex = 1;
  menuPopup = {};
  tabRefList = [];
  uris = [];
  subscriptionUrlChanged = {};
  subscriptionAppUpdate = {};
  tabManager = {};

  componentWillMount() {
    this.props.createTab(0);
    this.initEvent();
    BackAndroid.addEventListener('hardwareBackPress', this.handleBack);
  }

  componentDidMount() {
    setTimeout(() => {
      this.appendPreservedTab();
    }, 500)
  }

  componentWillUnmount () {
    // 重置tab 防止计数错误
    this.props.resetTab();
    this.unRegisterEvent();
    BackAndroid.removeEventListener('hardwareBackPress', this.handleBack);
  }

  componentWillReceiveProps(nextProps) {
  }

  render() {
    return (
      <View style={styles.container} >
        {this.renderOverlayBody()}
        {this.renderMenuPopup()}
        {this.renderTabManager()}
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
            homePressFn={this.goHome}
            forwardPressFn={this.forwardWeb}
            refreshPressFn={this.refreshWeb}
            pushHistory={this.pushHistory}
            pushSetting={this.pushSetting}
            pushDownload={this.pushDownload}
           />
  }

  renderTabManager = () => {
    return <TabManager
            ref={(view) => {this.tabManager = view}}
            viewList={[]}
            currentListIndex={0}
            onAppendTab={this.appendTab}
            onSwitchTab={this.switchTab}
            onCloseTab={this.closeTab}
            onHide={this.onNavigatorPop}
           />;
  }

  startTabManagerPage = () => {
    this.pauseWebThen(() => {
      let refTempList = this.tabRefList.slice();
      refTempList.pop();
      console.log('startTabManagerPage: refTempList length: ' + refTempList.length);
      let viewList = refTempList.map((e, i) => {
        console.log('startTabManagerPage: index: ' + i + ' tabId: ' + e.id);
        return {
          tag: findNodeHandle(e.tab),
          title: e.tab.getTitleText()
        }
      });
      this.tabManager.showWithNewData({
        viewList: viewList,
        currentListIndex: this.findViewByTabId(this.state.currentTabId),
        tabs: this.props.tabs,
      })
    });
  }

  goHome = () => {
    let currentTabRef = this.tabRefList.find(e => e.id === this.state.currentTabId);
    currentTabRef && currentTabRef.tab && currentTabRef.tab.goHome();
  }

  forwardWeb = () => {
    let currentTabRef = this.tabRefList.find(e => e.id === this.state.currentTabId);
    currentTabRef && currentTabRef.tab && currentTabRef.tab.forwardWeb();
  }

  refreshWeb = () => {
    let currentTabRef = this.tabRefList.find(e => e.id === this.state.currentTabId);
    currentTabRef && currentTabRef.tab && currentTabRef.tab.refreshWeb();
  }

  pushDownload = () => {
    this.pauseWebThen(() => {
      this.props.navigator.push({
        component: DownloadManagerPage,
        scene: Transitions.LeftToRight,
        onNavigatorPop: this.onNavigatorPop
      });
    });
  }

  pushHistory = () => {
    this.pauseWebThen(() => {
      console.log('push history');
      this.props.navigator.push({
        component: HistoryPage,
        scene: Transitions.LeftToRight,
        onNavigatorPop: this.onNavigatorPop
      });
    })
  }

  pushSetting = () => {
    this.pauseWebThen(() => {
      this.props.navigator.push({
        component: SettingPage,
        scene: Transitions.LeftToRight,
        onNavigatorPop: this.onNavigatorPop
      });
    });
  }

  pauseWebThen = (fn: Function) => {
    console.log('pauseWebThen pauseWeb');
    let currentTabRef = this.tabRefList.find(e => e.id === this.state.currentTabId);
    currentTabRef && currentTabRef.tab && currentTabRef.tab.pauseWeb();
    fn && fn();
  }

  onNavigatorPop = () => {
    console.log('onNavigatorPop resumeWeb');
    let currentTabRef = this.tabRefList.find(e => e.id === this.state.currentTabId);
    currentTabRef && currentTabRef.tab && currentTabRef.tab.resumeWeb();
  }

  showCurrentTabAtFront() {
    var currentId: number = this.state.currentTabId;
    console.log('showCurrentTabAtFront: currentId: ' + currentId);
    var excludeCurrentTabList =
      this.state.tabList.filter(e => e.id != currentId);
    return [...excludeCurrentTabList, this.findViewByTabId(currentId)];
  }

  findViewByTabId(tabId): any {
    let tab = null;
    this.state.tabList.forEach(e => tabId === e.id && (tab = e));
    return tab;
  }

  findIndexByTabId(tabId: number): number {
    let findId = 0;
    this.state.tabList.forEach((e, i) => tabId === e.id && (findId = i));
    return findId;
  }

  initEvent() {
    this.subscriptionUrlChanged = Emitter.addListener('url_changed', (...args) => {
      let url = args[0];
      this.onUrlChanged(url);
    });
    this.subscriptionAppUpdate = Emitter.addListener('app_update', (...args) => {
      this.props.navigator.popToTop();
      let url = args[0];
      console.log('url: ' + url);
      if (url) {
        this.onUrlChanged(url)
      }
    })
  }

  unRegisterEvent() {
    this.subscriptionUrlChanged.remove();
    this.subscriptionAppUpdate.remove();
  }

  onUrlChanged = (url: string) => {
    let currentTabRef = this.tabRefList.find(e => e.id === this.state.currentTabId);
    currentTabRef && currentTabRef.tab && currentTabRef.tab.reloadUrl(url);
  }

  appendTab = () => {
    var primaryId = this.tabIncreaseIndex;
    console.log('appendTab, tabIncreaseIndex: ' + this.tabIncreaseIndex);
    this.tabIncreaseIndex++;
    this.setState({
      currentTabId: primaryId
    });
    setTimeout(() => {
      this.props.createTab(primaryId);
    }, 50)
    setTimeout(() => {
      this.appendPreservedTab();
    }, 300);
  }

  // 预加载tab, 为了加快创建tab的速度
  appendPreservedTab = () => {
    var primaryId = this.tabIncreaseIndex;
    console.log('appendPreservedTab, tabIncreaseIndex: ' + this.tabIncreaseIndex);
    // this.tabIncreaseIndex++;
    this.setState({
      tabList: [
        ...this.state.tabList,
        {
          id: primaryId,
          view: this.renderTab(primaryId)
        }
      ],
      // currentTabId: currentTabCount // tabID依然是当前tab
    })
  }

  switchTab = (id: number) => {
    this.setState({
      currentTabId: id
    })
  }

  closeTab = (id: number) => {
    console.log('closeTab: ' + id + ', tabLength: ' + this.state.tabList.length);
    // 默认两个页面: 一个显式 一个preserved
    if (this.state.tabList.length == 2) {
      this.goHome();
      return;
    }

    this.props.removeTab(id);

    var tempList = this.state.tabList.slice();
    console.log('before: id: ' + id + ', tempList: ' + tempList.length);

    var nearest = findNearestElement(tempList, id);
    var toDeleteId = this.findIndexByTabId(id)
    if (toDeleteId || toDeleteId === 0) {
      tempList.splice(toDeleteId, 1);
      this.tabRefList.splice(toDeleteId, 1);
    }
    console.log('after: deleteId: ' + toDeleteId + ', tempList: ' + tempList.length);
    var currentTabId = nearest;
    this.setState({
      tabList: tempList,
      currentTabId: currentTabId
    })
    console.log('==== _closeWeb switchTab: ' + currentTabId);

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
          ref={(tab) => tab && this.tabRefList.push({id: id, tab: tab})}
          menuPressFn={(isTabPage: bool) => this.menuPopup.open(isTabPage)}
          tabPressFn={() => this.startTabManagerPage()}
          tabLongPressFn={() => this.goHome()}
          parentNavigator={this.props.navigator}/>
      </View>
    )
  }

  handleBack = () => {
    if (this.menuPopup.isVisible()) {
      this.menuPopup.close();
      return true
    }
    if (this.tabManager.isVisible()) {
      this.tabManager.hide();
      return true;
    }
    const navigator = this.props.navigator
    const routers = navigator.getCurrentRoutes();
    if (routers.length > 1) {
      navigator.pop();
      return true;
    }

    let currentTabRef = this.tabRefList.find(e => e.id === this.state.currentTabId);
    let dontExit = currentTabRef && currentTabRef.tab && currentTabRef.tab.back();
    if (!dontExit) {
      this.props.resetTab();
    }
    return dontExit;
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
    top: TOP_OFFSET,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
})

function mapStateToProps(state) {
  return {
    tabs: state.tabinfo.tabIds || [],
  }
}

function mapDispatchToProps(dispatch) {
  return {
    createTab: (id: number) => {
      dispatch(createTab(id))
    },
    removeTab: (id: number) => {
      dispatch(removeTab(id))
    },
    resetTab: () => {
      dispatch(resetTab())
    },
  }
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps)(TabController)
