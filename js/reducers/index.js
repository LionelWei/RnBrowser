import { combineReducers } from 'redux'
import searchhistory from './searchhistory'
import tabinfo from './tabinfo'
import tabmanage from './tabmanage'

export default combineReducers({
  searchhistory,
  tabinfo,
  tabmanage
})
