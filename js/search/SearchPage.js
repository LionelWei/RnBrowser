/* @flow */

import React, { Component, PropTypes } from 'react'
import {connect} from 'react-redux'
import {
  Platform,
  View,
  Navigator,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ListView,
  Image,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  PixelRatio,
} from 'react-native'

import TouchableButton from '../components/TouchableButton'
import * as IMG from '../assets/imageAssets'
import * as Consts from '../utils/Consts'
import Transitions from '../animation/NavigatorAnimation'
import ProxySettingPage from '../setting/ProxySettingPage'

import {append, remove} from '../reducers/searchhistory'
import {getSearchUrl} from './SearchEngine'

const dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class SearchPage extends Component {

  state = {
    searchList: [],
    isCurrentUrlWebSite: false,
  }

  loadingUrl: string = ''
  ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
  textInput = {};
  isOnScroll = false;
  hasTextChanged = false;

  componentWillMount() {
    console.log('listData:');
    JSON.stringify(this.props.listData, null, 2);
    // 显示数组需要反转(时间从远到近)
    let displayList = this.props.listData.reverse()
    this.setState({
      searchList: this.ds.cloneWithRows(displayList)
    })
  }

  componentWillUnmount() {
    console.log('==== componentWillUnmount: loadingUrl: ' + this.loadingUrl);
  }

  render() {
    // workaround: ios和Android对于同一个behavior值不一致
    let behavior = Consts.isIOS ? 'padding' : 'height';
    return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={{flex: 1, flexDirection: 'column-reverse', backgroundColor: 'white'}}>
          <KeyboardAvoidingView
            behavior={behavior}>
            {this.renderTitleBar()}
          </KeyboardAvoidingView>
          <View>
            {this.renderSearchList()}
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }

  renderTitleBar = () => {
    let returnKeyType = Consts.isIOS ? 'go' : 'search'
    let rightButtonImg = this.state.isCurrentUrlWebSite
                        ? IMG.ICON_SEARCH_GO
                        : IMG.ICON_SEARCH_NORMAL
    console.log('PixelRatio.getFontScale(): ' + PixelRatio.getFontScale());
    console.log('PixelRatio.getScale(): ' + PixelRatio.get());
    return (
      <View style={[styles.titlebar, styles.shadow]}>
        <TouchableButton
          width={18}
          height={18}
          pressFn = {this.cancel}
          normalBg = {IMG.ICON_WEB_STOP_LOADING} />
        <TextInput
          ref={textInput => this.textInput = textInput}
          style={{
            flex: 1,
            marginTop: 4,
            marginBottom: 4,
            paddingLeft: 8,
            borderRadius: 4,
            backgroundColor: '#f1f2f3',
            color: 'black',
            fontSize: Consts.spFont(16)}}
          autoCapitalize="none"
          autoFocus={true}
          autoCorrect={false}
          defaultValue={this.props.defaultUrl}
          selectTextOnFocus={true}
          placeholder="请输入网址"
          underlineColorAndroid='transparent'
          returnKeyType={returnKeyType}
          onSubmitEditing={() => this.textInput.blur()}
          onEndEditing={() => this.search(this.loadingUrl)}
          onChangeText={this.handleTextInputChange}
        />
        <TouchableButton
          width={18}
          height={18}
          pressFn = {() => {this.search(this.loadingUrl)}}
          normalBg = {rightButtonImg}/>
      </View>
    )
  }

  renderSearchList = () => {
    return (
      <ListView
        dataSource={this.state.searchList}
        renderRow={(rowData) => this.renderItem(rowData)}
        keyboardShouldPersistTaps={true}
        onScroll={this.onScroll}
      />
    )
  }

  renderItem = (itemData) => {
    let {url, isWebUrl} = itemData;
    let imgSource = isWebUrl ? IMG.ICON_SEARCH_WEBSITE : IMG.ICON_SEARCH_ENGINE
    return (
      <TouchableOpacity
        style={{flex:1, height: 48}}
        onPress={() => this.searchItem(url)}>
        <View style={styles.item_container}>
          <Image
            style={{width: 20, height: 20, marginRight: 10,}}
            source={imgSource}/>
          <Text
            style={styles.title}
            numberOfLines={1}>
            {url}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  back = () => {
    this.props.navigator.pop();
  }

  cancel = () => {
    Keyboard.dismiss();
    setTimeout(() => {
      this.props.navigator.pop();
    }, 100);
  }

  onScroll = () => {
    this.isOnScroll = true;
    Keyboard.dismiss();
  }

  searchItem = (url: string) => {
    this.hasTextChanged = true;
    this.search(url);
  }
  // 如果url不是链接, 则拼接成百度搜索
  // 非链接依据:
  // 1) 有空格
  // 2) 没有点
  search = (inputUrl: string) => {
    if (this.isOnScroll) {
      this.isOnScroll = false;
      return;
    }

    let realInputUrl = this.hasTextChanged ? inputUrl : (this.props.defaultUrl || '');
    console.log('realInputUrl: ' + realInputUrl);
    let trimedInput = realInputUrl.trim();

    let url: string = trimedInput;

    if (url.length === 0) {
      return;
    }

    if (this.checkHiddenCommand(url)) {
      return;
    }

    this.props.navigator.pop();

    let isWebUrl = this.isWebsite(url);
    url = isWebUrl ? getUrlWithProtocol(url) : getSearchUrl(url)

    this.props.append(trimedInput, isWebUrl)

    // this.props.navigator.pop() // 退栈在上一级nav中处理
    this.loadingUrl = url;
    if (this.loadingUrl.length > 0) {
      this.props.onUrlChanged(this.loadingUrl)
    }

    function getUrlWithProtocol(url) {
      if (!/^[a-zA-Z-_]+:/.test(url)) {
        return 'http://' + url;
      }
      return url;
    }
  }

  handleTextInputChange = (loadingUrl: string) => {
    this.hasTextChanged = true;
    this.loadingUrl = loadingUrl;
    let sourceData = this.props.listData;
    let filterData = sourceData.filter(e => e.url.includes(this.loadingUrl))
    // 显示数组需要反转(时间从远到近)
    let displayList = filterData.reverse()
    this.setState({
      searchList: this.ds.cloneWithRows(displayList),
      isCurrentUrlWebSite: this.isWebsite(loadingUrl)
    })
  };

  isWebsite = (url: string): bool => {
    return url != null
        && !~url.indexOf(' ')
        && !!~url.indexOf('.')
        && url.indexOf('.') < url.length - 2 //后缀必须是两个字符以上..
  }

  checkHiddenCommand = (url: string) => {
    // 隐藏指令
    if (url === '*#proxy#*') {
      this.props.navigator.replace({
        component: ProxySettingPage,
        scene: Transitions.LeftToRight,
      });
      return true;
    }
    return false;
  }
}

const styles = StyleSheet.create({
  titlebar: {
    flexDirection: 'row',
    height: Consts.SEARCH_BAR_HEIGHT,
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopWidth: 1 / PixelRatio.get(),
    borderTopColor: '#f1f2f3',
  },
  shadow: {
    elevation: 4,
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {
      height: 2,
    },
  },
  item_container: {
    flex:1,
    flexDirection: 'row',
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1 / PixelRatio.get(),
    borderBottomColor: '#f1f2f3',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: Consts.spFont(16),
    color: 'black',
    alignSelf: 'center'
  },
})

function mapStateToProps(state) {
  return {
    listData: state.searchhistory.list
  }
}

function mapDispatchToProps(dispatch) {
  return {
    append: (url, isWebUrl) => dispatch(append(url, isWebUrl)),
    remove: (url) => dispatch(remove(url))
  }
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps, null, {withRef: true})(SearchPage)
