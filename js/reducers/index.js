import { combineReducers } from 'redux'
import counter from './counter'
import SearchHistory from './SearchHistory'

export default combineReducers({
  counter,
  SearchHistory
})
