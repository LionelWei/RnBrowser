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
  BackAndroid
} from 'react-native';
import {connect} from 'react-redux'
import { takeSnapshot } from "react-native-view-shot";
import {NAV_BAR_HEIGHT ,BOTTOM_BAR_HEIGHT} from '../utils/Consts'

var {height: HEIGHT, width: WIDTH} = Dimensions.get('window');

import {Emitter} from '../events/Emitter'
import {printObj} from '../utils/Common'

import Transitions from '../animation/NoTransition'
import TabNavigator from './main/TabNavigator'
import TabManageScreen from './manage/TabManageScreen'
import TabBottomBar from './main/TabBottomBar'
import WebTitleBar from './web/WebTitleBar'
import WebBottomBar from './web/WebBottomBar'
import BottomMenuPopup from '../bottompopup/BottomMenuPopup'
import {showTabManager, updateTabThumbUris} from '../reducers/tabmanage'
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

  componentDidMount () {
    BackAndroid.addEventListener('hardwareBackPress', this.handleBack)
  }

  componentWillUnmount () {
    BackAndroid.removeEventListener('hardwareBackPress', this.handleBack)
  }

  componentWillReceiveProps(nextProps) {
    // setTimeout(() => {
    //   if (nextProps.isTabManagerVisible) {
    //     this.startTabManagerScreen(true)
    //   }
    // }, 400)
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

  uris = []
  webBottomBar = null

  renderBottomBar = () => {
    if (this.props.isCurrentTabPage) {
      this.webBottomBar = null;
      return <TabBottomBar
              menuPressFn={() => this.menuPopup.open()}
              tabPressFn={() => this.startTabManagerScreen(true)}/>
    } else {
      return <WebBottomBar
              ref={(bar) => this.webBottomBar = bar}
              menuPressFn={() => this.menuPopup.open()}
              tabPressFn={() => this.startTabManagerScreen(true)}
              homePressFn={() => this.goToHome(this.state.currentTabId)}/>
    }
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

    navigator.push({
      component: TabManageScreen,
      currentListIndex: this.findIndexByTabId(this.state.currentTabId),
      scene: BottomToTop,
    })

    console.log('==== startTabManagerScreen tabRefList length: ' + this.tabRefList.length);

    var promises = this.tabRefList.map(ref => {
      console.log('########## takeSnapshot...');
      return takeSnapshot(ref, {
        format: 'jpg',
        quality: 0.6,
      })
    })
    Promise.all(promises).then(
      uris => {
        this.props.updateTabThumbUris(uris)
        console.log('uris: ' + uris.toString());
      },
      error => console.error("Oops, snapshot failed", error)
    )
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
      tempList.splice(toDeleteId, 1);
      this.tabRefList.splice(toDeleteId, 1);
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
          ref={(tab) => {tab && this.tabRefList.push(tab)}}/>
      </View>
    )
  }

  goToHome(tabId: number) {
    let index: number = this.findIndexByTabId(tabId);
    this.tabRefList[index].popToMain();
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

    // 如果当前页面是tab首页, 则退出app
    // 如果是web页面, 则执行返回操作
    if (this.props.isCurrentTabPage) {
      return false;
    } else {
      Emitter.emit('web_back', this.state.currentTabId);
      return true;
    }
  };
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
    },
    updateTabThumbUris: (uris: Array<String>) => {
      dispatch(updateTabThumbUris(uris))
    }
  }
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps)(TabController)
