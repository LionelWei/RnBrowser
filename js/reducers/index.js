import { combineReducers } from 'redux'
import searchhistory from './searchhistory'
import webnavigator from './webnavigator'
import webtabs from './webtabs'

export default combineReducers({
  searchhistory,
  webnavigator,
  webtabs
})
