/* @flow */

import React, { Component } from 'react'
import reducers from './reducers'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {persistStore, autoRehydrate} from 'redux-persist'
import {createStore, applyMiddleware} from 'redux'
import {AsyncStorage} from 'react-native'
import {nonPersistList} from './reducers/nonpersistlist'

import {
  Platform,
  BackAndroid,
  View,
  Navigator,
  Text,
  ToastAndroid
} from 'react-native'
import Home from './home/HomeScene'
import CustomStatusBar from './components/CustomStatusBar'

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore)
const store = autoRehydrate()(createStoreWithMiddleware)(reducers)
persistStore(store, {
    blacklist: nonPersistList,
    storage: AsyncStorage
  }, null)

console.disableYellowBox = true;

export default class extends Component {

  componentDidMount () {
    // BackAndroid.addEventListener('hardwareBackPress', this.handleBack)
  }

  componentWillUnmount () {
    // BackAndroid.removeEventListener('hardwareBackPress', this.handleBack)
  }

  render() {
    return (
      <Provider store={store}>
        <View style={{
          flex: 1,
          flexDirection: 'column'}}>
          <CustomStatusBar />
          <Navigator
            style={{
              flex: 1}}
            ref='navigator'
            initialRoute={{
              component: Home,
              head: true
            }}
            configureScene={this.configureScene}
            renderScene={(route, navigator) => {
              return <route.component
                        navigator={navigator}
                        {...route}
                        {...route.passProps}/>
            }}
          />
        </View>
      </Provider>
    )
  }

  configureScene (route: Object) {
    return route.scene || Navigator.SceneConfigs.FloatFromBottom
  }

  lastBackPressed = Date.now();

  handleBack = () => {
    const navigator = this.refs.navigator

    const routers = navigator.getCurrentRoutes();
    if (routers.length >= 1) {
      const top = routers[routers.length - 1];
      const handleBack = top.handleBack || top.component.handleBack;
      console.log('handleBack: ' + handleBack + ', component: ' + top.component + ', top: ' + top);
      if (handleBack) {
        // 路由或组件上决定这个界面自行处理back键
        return handleBack();
      }

      if (routers.length > 1) {
        // 默认行为： 退出当前界面。
        navigator.pop();
        return true;
      }
    }
    return false;
  };
}
