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
  PanResponder,
  KeyboardAvoidingView,
  Keyboard
} from 'react-native'

import TouchableButton from '../components/TouchableButton'
import {isIOS, NAV_BAR_HEIGHT} from '../utils/Consts'
import * as IMG from '../assets/imageAssets'

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

  componentWillMount() {
    console.log('listData:');
    JSON.stringify(this.props.listData, null, 2);
    this.setState({
      searchList: this.ds.cloneWithRows(this.props.listData)
    })
  }

  componentWillUnmount() {
    console.log('==== componentWillUnmount: loadingUrl: ' + this.loadingUrl);
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        {this.renderTitleBar()}
        {this.renderSearchList()}
      </View>
    )
  }

  renderTitleBar = () => {
    let returnKeyType = isIOS ? 'go' : 'search'
    let rightButtonImg = this.state.isCurrentUrlWebSite
                        ? IMG.ICON_SEARCH_GO
                        : IMG.ICON_SEARCH_NORMAL
    return (
      <View style={styles.titlebar}>
        <TouchableButton
          pressFn = {this.cancel}
          normalBg = {IMG.ICON_WEB_STOP_LOADING} />
        <TextInput
          ref={textInput => this.textInput = textInput}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            color: 'black',
            fontSize: 16}}
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
        <View style={{
          paddingLeft: 12,}}>
          <TouchableButton
            pressFn = {() => {console.log('from button');this.search(this.loadingUrl)}}
            normalBg = {rightButtonImg}/>
        </View>
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
        onPress={() => this.search(url)}>
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
    this.props.navigator.pop()
  }

  cancel = () => {
    this.props.navigator.pop()
  }

  onScroll = () => {
    this.isOnScroll = true;
    Keyboard.dismiss()
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
    console.log('search: ' + inputUrl);
    let trimedInput = inputUrl.trim();
    let url: string = trimedInput;

    if (url.length === 0) {
      this.props.navigator.pop()
      return;
    }

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
    this.loadingUrl = loadingUrl;
    let sourceData = this.props.listData;
    let filterData = sourceData.filter(e => e.url.includes(this.loadingUrl))
    this.setState({
      searchList: this.ds.cloneWithRows(filterData),
      isCurrentUrlWebSite: this.isWebsite(loadingUrl)
    })
  };

  isWebsite = (url: string): bool => {
    return url != null
        && url.indexOf(' ') == -1
        && url.indexOf('.') != -1
        && url.indexOf('.') < url.length - 2 //后缀必须是两个字符以上..
  }
}

const styles = StyleSheet.create({
  titlebar: {
    flexDirection: 'row',
    height: NAV_BAR_HEIGHT,
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  item_container: {
    flex:1,
    flexDirection: 'row',
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f3',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 16,
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
