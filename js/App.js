/* @flow */

import React, { Component } from 'react'
import reducers from './reducers'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {persistStore, autoRehydrate} from 'redux-persist'
import {createStore, applyMiddleware} from 'redux'
import {AsyncStorage} from 'react-native'
import {nonPersistList} from './reducers/nonpersistlist'

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore)
const store = autoRehydrate()(createStoreWithMiddleware)(reducers)
persistStore(store, {
    blacklist: nonPersistList,
    storage: AsyncStorage
  }, null)

import {
  Platform,
  StatusBar,
  BackAndroid,
  View,
  Navigator,
  Text
} from 'react-native'
import Home from './home/HomeScene'

export const STATUS_BAR_HEIGHT = (Platform.OS === 'ios' ? 20 : 25)
export const NAV_BAR_HEIGHT = (Platform.OS === 'ios' ? 44 : 56)
export const ABOVE_LOLIPOP = Platform.Version && Platform.Version > 19

console.disableYellowBox = true;

export default class extends Component {

  componentDidMount () {
    BackAndroid.addEventListener('hardwareBackPress', this.handleBack)
  }

  componentWillUnmount () {
    BackAndroid.removeEventListener('hardwareBackPress', this.handleBack)
  }

  render() {
    return (
      <Provider store={store}>
        <View style={{
          flex: 1,
          flexDirection: 'column',
          backgroundColor: 'transparent'}}>
          <StatusBar
            barStyle='default'
            hidden={true}
            backgroundColor='blue'
            style={{height: STATUS_BAR_HEIGHT, backgroundColor: 'red'}}
            translucent={ABOVE_LOLIPOP}
          />
          <Navigator
            style={{
              flex: 1,
              backgroundColor: 'transparent'}}
            ref='navigator'
            initialRoute={{
              component: Home
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

  handleBack = () => {
    const navigator = this.refs.navigator
    if (navigator && navigator.getCurrentRoutes().length > 1) {
      navigator.pop()
      return true
    }
    return false
  };
}
