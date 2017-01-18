import { combineReducers } from 'redux'
import searchhistory from './searchhistory'
import tabinfo from './tabinfo'
import download from './download'
import browsehistory from './browsehistory'

export default combineReducers({
  searchhistory,
  tabinfo,
  download,
  browsehistory,
})
