import { combineReducers } from 'redux'
import counter from './counter'
import searchhistory from './searchhistory'
import webnavigator from './webnavigator'

export default combineReducers({
  counter,
  searchhistory,
  webnavigator
})
