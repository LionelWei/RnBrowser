/*
 * @flow */

import React, {PropTypes, Component } from 'react';
import {
  View,
  Text,
  Dimensions,
  Navigator,
  StyleSheet,
  Platform,
  WebView,
  StatusBar,
  Alert,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ToastAndroid,
  Animated
} from 'react-native';

import {connect} from 'react-redux'
import {Emitter} from '../events/Emitter'
import TabPage from './main/TabPage'
import WebPage from './web/WebPage'
import Search from '../search/SearchPage'
import {
  WebBottomBar,
  BOTTOM_BAR_HEIGHT_NORMAL,
  BOTTOM_BAR_HEIGHT_MIN,
} from './web/WebBottomBar'
import Transitions from '../animation/NavigatorAnimation'
import RNFetchBlob from 'react-native-fetch-blob'
import * as Consts from '../utils/Consts'

const dirs = RNFetchBlob.fs.dirs
const POPUP_SIZE = {w: 100, h: 44};

class TabNavigator extends Component {
  navigator = {};
  enableBackGesture = true;
  navBar = undefined;
  title = '';
  views = {}; // WARNING: 内存泄漏!!!
  currentIndex = 0;
  isShowBottomBarWhole = true;

  // 弹窗: 保存图片
  imagePopup = null;
  imageMenu = null;
  imageUrl = null;
  isImagePopShown = false;
  firstRoute = {
    index: 0,
    component: TabPage,
    type: 'tab',
    id: this.props.id,
    menuPressFn: this.props.menuPressFn,
    tabPressFn: this.props.tabPressFn,
    tabLongPressFn: this.props.tabLongPressFn,
  };

  componentWillMount() {
    StatusBar.setHidden(false);
    StatusBar.setBackgroundColor('#00b4ff')
    StatusBar.setBarStyle(Consts.isIOS ? 'dark-content' : 'light-content')
  }

  componentDidMount() {
    this.hideImagePopup();
  }

  componentWillUnmount() {
  }

  lastTime = 0;
  // 返回false则退出应用
  back = () => {
    if (this.isImagePopShown) {
      this.hideImagePopup();
      return true;
    }
    this.hideImagePopup();
    if (this.currentIndex !== 0) {
      let view = this.views[this.currentIndex];
      this.isWrapperInstanceValid(view) && view.getWrappedInstance().back();
      return true;
    }

    // 按两次返回退出
    // TODO

    let currentTime = parseInt(new Number(new Date()));
    if (currentTime - this.lastTime > 2000) {
      ToastAndroid.show('再按一次退出程序', ToastAndroid.SHORT);
      this.lastTime = currentTime;
      return true;
    }
    this.lastTime = currentTime;
    return false
  }

  getTitleText = () => {
    let view = this.views[this.currentIndex];
    return this.isWrapperInstanceValid(view) && view.getWrappedInstance().getTitleText();
  }

  reloadUrl = (url: string) => {
    this.onHistoryUrlChanged(url);
  }

  goHome = () => {
    this.navigator.jumpTo(this.firstRoute);
  }

  forwardWeb = () => {
    let view = this.views[this.currentIndex];
    this.isWrapperInstanceValid(view) && view.getWrappedInstance().forward();
  }

  refreshWeb = () => {
    let view = this.views[this.currentIndex];
    this.isWrapperInstanceValid(view) && view.getWrappedInstance().refresh();
  }

  resumeWeb = () => {
    let view = this.views[this.currentIndex];
    this.isWrapperInstanceValid(view)
    && view.getWrappedInstance().resume
    && view.getWrappedInstance().resume();
  }

  pauseWeb = () => {
    let view = this.views[this.currentIndex];
    this.isWrapperInstanceValid(view)
    && view.getWrappedInstance().pause
    && view.getWrappedInstance().pause();
  }

  render() {
    return (
      <View style={{
        flex: 1,
        backgroundColor: 'white'}}>
        <Navigator
          style={styles.container}
          ref={(navigator) => this.navigator = navigator}
          navigationBar={
            <NavBar
              ref={nb => this.navBar = nb}
              navigator={this.navigator}
              menuPressFn={this.props.menuPressFn}
              tabPressFn={this.props.tabPressFn}
              tabLongPressFn={(this.props.tabLongPressFn)}
              backFn={this.back}
              onSearch={this.onSearch}
              onNavProgressUpdate={this.onNavProgressUpdate} />
          }
          initialRoute={this.firstRoute}
          configureScene={this.configureScene}
          onDidFocus={this.onDidFocus}
          renderScene={(route, navigator) => {
            switch (route.type) {
              case 'web':
                return this.renderWeb(route, navigator);
              case 'tab':
              default:
                return this.renderTab(route, navigator);
            }
          }}
        />
        {this.renderLongPressImagePopup()}
      </View>
    )
  }

  renderWeb = (route: any, navigator: any) => {
    return (
      <View style={{flex: 1}}>
        <route.component
          ref={(component) => {
            this.views[route.index] = component
          }}
          navigator={navigator}
          isShowBottomBarWhole={this.isShowBottomBarWhole}
          onBottomBarAsWhole={this.onBottomBarAsWhole}
          onWebStateUpdate={this.onWebStateUpdate}
          onTitleUpdate={this.onTitleUpdate}
          {...route}
          {...route.passProps}/>
      </View>
    )
  }

  renderTab = (route: any, navigator: any) => {
    return (
      <View style={{flex: 1}}>
        <route.component
          ref={(component) => {
            this.views[route.index] = component
          }}
          navigator={navigator}
          onSearch={this.onSearch}
          onSearchUrlChanged={this.onSearchUrlChanged}
          goToWebWithConfirm={this.goToWebWithConfirm}
          onTitleUpdate={this.onTitleUpdate}
          {...route}
          {...route.passProps}/>
      </View>
    )
  }

  renderLongPressImagePopup = () => {
    // 用于长按之后显示保存图片的弹窗
    return (
      <TouchableWithoutFeedback
        onPress={this.hideImagePopup}>
        <View
          ref={(view) => this.imagePopup = view}
          style={{
            left: 0,
            top: 0,
            width: Consts.SCREEN_WIDTH,
            height: Consts.SCREEN_HEIGHT,
            position: 'absolute',
          }}>
            <View
              ref={(view) => this.imageMenu = view}
              style={{
                left: 0,
                bottom: 0,
                width: POPUP_SIZE.w,
                height: POPUP_SIZE.h,
                backgroundColor: 'white',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                backgroundColor: 'white',
                position: 'absolute',
              }}>
              <TouchableOpacity onPress={this.saveImage}>
                <View style={{
                  width: POPUP_SIZE.w,
                  height: POPUP_SIZE.h,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                }}>
                  <Text style={{color: 'black', fontSize: Consts.spFont(14)}}>保存图片</Text>
                </View>
              </TouchableOpacity>
            </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }

  showImagePopup = () => {
    this.imagePopup && this.imagePopup.setNativeProps({style: {top: 0,}})
    this.isImagePopShown = true;
  }

  hideImagePopup = () => {
    this.imagePopup && this.imagePopup.setNativeProps({style: {top: -1000,}})
    this.isImagePopShown = false;
  }

  saveImage = () => {
    let view = this.views[this.currentIndex];
    if (!this.isWrapperInstanceValid(view)) {
      return;
    }
    this.hideImagePopup();
    view.getWrappedInstance().saveImage(this.imageUrl);
  }

  onWebLongPress = (event: Object) => {
    let {x, y} = event;
    if (event.mime === 'image') {
      this.imageUrl = event.url;
      this.imageMenu && this.imageMenu.setNativeProps({style: {
        left: Math.min(x + POPUP_SIZE.w / 10, Consts.SCREEN_WIDTH - POPUP_SIZE.w),
        bottom: Consts.SCREEN_HEIGHT - y - POPUP_SIZE.h,
      }});
      this.showImagePopup();
    }
  }

  configureScene = (route: Object) => {
    let pageTransition = Transitions.WebPageSwipe;
    if (this.enableBackGesture === false) {
      pageTransition = Transitions.NONE;
    }
    return pageTransition;
  }

  onDidFocus = (route: any) => {
    console.log('onDidFocus: ' + route.index);
    this.currentIndex = route.index;
    this.navBar && this.navBar.showNavBar(route['type'] === 'web');
    if (route['type'] === 'web') {
      let view = this.views[route.index];
      this.isWrapperInstanceValid(view) && view.getWrappedInstance().resume();
      this.isWrapperInstanceValid(view) && view.getWrappedInstance().updateTitle();
    }

    // iOS的WKWebView支持手势前进后退时, 所以push新的webview
    if (this.currentIndex !== 0 && this.navigator) {
      let enabled = false;
      if (Consts.isIOS) {
        let view = this.views[route.index];
        enabled = this.isWrapperInstanceValid(view) && view.getWrappedInstance().canGoForward();
        console.log('IOS forward enabled: ' + enabled);
      } else {
        let currentRoutes = this.navigator.getCurrentRoutes();
        let routeIndex = currentRoutes.indexOf(route);
        enabled = ~routeIndex && routeIndex < currentRoutes.length - 1;
      }
      Emitter.emit('enableForward', enabled);
    }

    // 暂停除了当前页面的其他所有webview的活动
    for (let p in this.views) {
      console.log('index in this.views: ' + p + ', this.currentIndex: ' + this.currentIndex);
      let index = +p;
      if (!this.views.hasOwnProperty(index) || index === 0 || index === this.currentIndex) {
        continue;
      }
      let view = this.views[index];
      this.isWrapperInstanceValid(view)
      && view.getWrappedInstance().pause
      && view.getWrappedInstance().pause();
    }
  }

  onBackGestureEnabled = (enabled: bool) => {
    this.enableBackGesture = enabled;
  }

  onBottomBarAsWhole = (index: number, asWhole: bool) => {
    // 只有当前页面变化时, 才更新底栏
    if (!this.isCurrentPage(index)) {
      return;
    }
    this.navBar && (asWhole ? this.navBar.showWhole() : this.navBar.showPartial());
    this.isShowBottomBarWhole = asWhole;
    for (let p in this.views) {
      let index = +p;
      if (!this.views.hasOwnProperty(index)) {
        continue;
      }
      let view = this.views[index];
      this.isWrapperInstanceValid(view)
      && view.getWrappedInstance().showBottoBarWhole
      && view.getWrappedInstance().showBottoBarWhole(asWhole);
    }
  }

  isWrapperInstanceValid = (view: any) => {
    return (view
        && typeof view.getWrappedInstance === 'function'
        && view.getWrappedInstance());
  }

  onWebStateUpdate = (index: number, navState: any) => {
    console.log('onWebStateUpdate: ' + JSON.stringify(navState, null, 2));
    // 只有当前页面变化时, 才更新底栏
    if (!this.isCurrentPage(index)) {
      return;
    }
    this.navBar && this.navBar.updateNavState(navState);
  }

  onTitleUpdate = (index: number, title: string, url: string) => {
    console.log('onTitleUpdate: ' + title);
    // 只有当前页面变化时, 才更新底栏
    if (!this.isCurrentPage(index)) {
      return;
    }
    this.navBar && this.navBar.updateTitle(title, url);
  }

  onNavProgressUpdate = (progress: number, fromIndex: number, toIndex: number) => {
    this.navBarTransistion(progress, fromIndex, toIndex, fromIndex);
    this.navBarTransistion(progress, fromIndex, toIndex, toIndex);
  }

  navBarTransistion = (progress: number, fromIndex: number, toIndex: number, index: number) => {
    let styleToUse = {};
    let sceneConfig = Transitions.WebPageSwipe;
    let useFn = index < fromIndex || index < toIndex ?
      sceneConfig.animationInterpolators.out :
      sceneConfig.animationInterpolators.into;
    let directionAdjustedProgress = fromIndex < toIndex ? progress : 1 - progress;
    let didChange = useFn(styleToUse, directionAdjustedProgress);
    if (didChange) {
      let translateX = styleToUse['translateX'];
      if (translateX !== null && translateX !== undefined) {
        this.navBar && this.navBar.updateStyle(styleToUse);
      }
    }
  }

  isCurrentPage = (index: number) => {
    return (index !== null
      && index !== undefined
      && index === this.currentIndex);
  }

  onSearch = (url: string) => {
    // 搜索页面用父nav, 防止网页跳转失效.
    this.props.parentNavigator &&
    this.props.parentNavigator.push({
      component: Search,
      type: 'search',
      scene: Transitions.NONE,
      defaultUrl: url || '',
      navigator: this.props.parentNavigator,
      onUrlChanged: this.onSearchUrlChanged,
    })
  }

  onHistoryUrlChanged = (url: string) => {
    // 将搜索页替换成web页
    console.log('### onHistoryUrlChanged url: ' + url);
    this.gotoWeb(url);
  }

  onSearchUrlChanged = (url: string) => {
    // 将搜索页替换成web页
    console.log('### onSearchUrlChanged url: ' + url);
    this.gotoWeb(url, true);
  }
/*{url.includes('youku')
      || url.includes('v.qq.com')
       || url.includes('iqiyi')
       ||}*/
  goToWebWithConfirm = (url: string) => {
    if (Consts.isIOS && (url.includes('bilibili') || url.includes('v.qq.com'))) {
        Alert.alert(
          '警告',
          'iOS版本视频暂不支持免流量，是否继续?',
          [
            {text: '取消', onPress: () => {}},
            {text: '好', onPress: () => this.gotoWeb(url)},
          ]
        )
        return;
    }
    this.gotoWeb(url)
  }

  gotoWeb = (url: string, replace: bool = false) => {
    console.log('=== gotoWeb url: ' + url);
    console.log('gotoWeb: route length: ' + this.navigator.getCurrentRoutes().length);
    this.onBackGestureEnabled(true);
    let index = Object.keys(this.views).length; // 可以保证index的唯一性
    this.navigator.push({
      index: index,
      component: WebPage,
      type: 'web',
      url: url,
      webLongPressFn: this.onWebLongPress,
      onPushNewWebPage: this.gotoWeb,
      onSearch: this.onSearch,
      onBackGestureEnabled: this.onBackGestureEnabled,
    });
  }
}

class NavBar extends Component {
  webBottomBar = {};
  viewRef = {};

  state = {
    animatedValue: new Animated.Value(1),
  }

  isShowWhole = true;

  shouldComponentUpdate(nextProps: any, nextState: any) {
    return false;
  }

  render() {
    return (
      <Animated.View
        ref={(view) => this.viewRef = view}
        style={[styles.navbar, {
          transform: [{
            translateY: this.state.animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [BOTTOM_BAR_HEIGHT_NORMAL - BOTTOM_BAR_HEIGHT_MIN, 0]
            })
        }]
      }]}>
        <View style={{flex: 1}}/>
        <WebBottomBar
          ref={(webBar) => {this.webBottomBar = webBar}}
          navigator={this.props.navigator}
          menuPressFn={() => this.props.menuPressFn(false)}
          tabPressFn={this.props.tabPressFn}
          tabLongPressFn={this.props.tabLongPressFn}
          onBack={this.props.backFn}
          onSearch={this.props.onSearch} />
      </Animated.View>
    )
  }

  showNavBar = (show) => {
    this.viewRef && this.viewRef.setNativeProps({style: [styles.navbar, {
      transform: [
        {
          translateX: show ? 0 : 1000
        },
        {
          translateY: this.isShowWhole ? 0 : BOTTOM_BAR_HEIGHT_NORMAL - BOTTOM_BAR_HEIGHT_MIN
        }
      ]
    }]});
  }

  updateStyle = (newStyle: any) => {
    this.viewRef && this.viewRef.setNativeProps({style: {
      transform: [
        {
          translateX: newStyle.translateX
        },
        {
          translateY: this.isShowWhole ? 0 : BOTTOM_BAR_HEIGHT_NORMAL - BOTTOM_BAR_HEIGHT_MIN
        }
      ]
    }});
  }

  showWhole = () => {
    Animated.spring(
      this.state.animatedValue, {
        toValue: 1,
        bounciness: 0,
        speed: 20,
      }
    ).start();
    this.webBottomBar.show();
    this.isShowWhole = true;
  }

  showPartial = () => {
    Animated.spring(
      this.state.animatedValue, {
        toValue: 0,
        bounciness: 0,
        speed: 20,
      }
    ).start();
    this.webBottomBar.hide();
    this.isShowWhole = false;
  }

  updateNavState = (navState: any) => {
    this.webBottomBar.updateNavState(navState);
  }

  updateTitle = (title: string, url: string) => {
    this.webBottomBar.updateNavState({
      title: title,
      url: url
    });
  }

  // 手势滑动时 隐藏 过后再显示
  updateProgress = (progress, fromIndex, toIndex) => {
    // 只有当往/从tab页面滑动时 才滑动navBar
    if (toIndex === 0 || fromIndex === 0) {
      this.props.onNavProgressUpdate(progress, fromIndex, toIndex);
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navbar: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: BOTTOM_BAR_HEIGHT_NORMAL + 4, // 略大于底栏高度 保证底栏阴影效果
    width: Consts.SCREEN_WIDTH,
  },
})

module.exports = TabNavigator
