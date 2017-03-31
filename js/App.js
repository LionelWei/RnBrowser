/* @flow */

import React, { Component } from 'react'
import reducers from './reducers'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {persistStore, autoRehydrate} from 'redux-persist'
import {createStore, applyMiddleware} from 'redux'
import {AsyncStorage} from 'react-native'
import {nonPersistList} from './reducers/nonpersistlist'
import {configProxy} from './nativemodules/WebProxySetting'
import codePush from "react-native-code-push";

import {
  Platform,
  BackAndroid,
  View,
  Navigator,
  Text,
  ToastAndroid,
  StatusBar,
} from 'react-native'
import Home from './home/HomePage'
import {
  PROXY_IP,
  PROXY_PORT,
  PROXY_UN,
  PROXY_PWD,
  PROXY_ENABLED,
  DEFAULT_IP,
  DEFAULT_PORT,
} from './utils/ProxyConsts'

const middlewares = [thunk];
if (__DEV__) {
  // const createLogger = require('redux-logger');
  // const logger = createLogger();
  // middlewares.push(logger);
}

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const store = autoRehydrate()(createStoreWithMiddleware)(reducers);
persistStore(store, {
    blacklist: nonPersistList,
    storage: AsyncStorage
  }, null)

if (!__DEV__) {
  console.log = () => {};
}
console.disableYellowBox = true;

class App extends Component {

  componentWillMount() {
  }

  componentWillUnmount () {
  }

  componentDidMount() {
    AsyncStorage.multiGet(
      [PROXY_IP, PROXY_PORT, PROXY_ENABLED])
      .then(arr => {
        let isProxyOn = arr[2][1]
        console.log('App isProxyOn: ' + isProxyOn);
        if (isProxyOn === null  || isProxyOn === undefined) {
          AsyncStorage.multiSet([
            [PROXY_IP, DEFAULT_IP],
            [PROXY_PORT, DEFAULT_PORT],
            [PROXY_UN, ''],
            [PROXY_PWD, ''],
            [PROXY_ENABLED, '1']
          ], err => {console.log(err)})
          configProxy({
            enabled: true,
            ip: DEFAULT_IP,
            port: parseInt(DEFAULT_PORT) || 0,
            userName: '',
            password: ''
          })
        }
      })
  }

  render() {
    return (
      <Provider store={store}>
        <View style={{flex: 1, backgroundColor: 'white'}}>
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
              return (
                <View style={{flex: 1}}>
                  <route.component
                    navigator={navigator}
                    {...route}
                    {...route.passProps}/>
                </View>
              )
            }}
          />
        </View>
      </Provider>
    )
  }

  configureScene (route: Object) {
    return route.scene || Navigator.SceneConfigs.FloatFromBottom
  }

}

let codePushOptions = { checkFrequency: codePush.CheckFrequency.ON_APP_START };
module.exports = codePush(codePushOptions)(App);
