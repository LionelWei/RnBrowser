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
  ToastAndroid,
  StatusBar,
} from 'react-native'
import Home from './home/HomeScene'

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore)
const store = autoRehydrate()(createStoreWithMiddleware)(reducers)
persistStore(store, {
    blacklist: nonPersistList,
    storage: AsyncStorage
  }, null)

console.disableYellowBox = true;

export default class extends Component {

  componentWillMount() {
    StatusBar.setHidden(false);
    StatusBar.setBackgroundColor('white')
  }

  componentWillUnmount () {
  }

  render() {
    return (
      <Provider store={store}>
        <View style={{flex: 1, backgroundColor: 'white'}}>
          <StatusBar
            hidden={false}
            backgroundColor='white'/>
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
                  <StatusBar
                    hidden={false}
                    backgroundColor='white'/>
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
