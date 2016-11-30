/* @flow */

import {printObj} from '../utils/Common'

const CREATE_TAB = 'CREATE_TAB'
const UPDATE_TAB = 'UPDATE_TAB'
const INIT_TAB = 'INIT_TAB'

const initialState = {
  tabs: []
}

var isFirstLaunch = true
var firstValidState;

export default function reducer (state: any = initialState, action: any) {
  console.log('webtabs type: ' + action.type);
  switch (action.type) {
    case INIT_TAB:
      return handleInitTab(state, action);
    case CREATE_TAB:
      return handleCreateTab(state, action);
    case UPDATE_TAB:
      return handleUpdateTab(state, action);
    default:
      return firstValidState || initialState
  }
}

function handleInitTab(state: any = initialState, action: any) {
  return initialState;
}

function handleCreateTab(state: any = initialState, action: any) {
  if (isFirstLaunch) {
    isFirstLaunch = false
    firstValidState = {
      tabs: [{
        id: action.id
      }]
    }
    return firstValidState
  } else {
    return {
      tabs: [
        ...state.tabs,
        {
          id: action.id
        }
      ]
    }
  }
}

function handleUpdateTab(state: any = initialState, action: any) {
  var newState = {...state};
  newState.tabs[action.id] = {
    id: action.id,
    url: action.url,
    title: action.title
  }
  return newState;
}

export function initTab() {
  return {
    type: INIT_TAB,
  }
}

export function createTab(id: number) {
  return {
    type: CREATE_TAB,
    id: id,
  }
}

export function updateTab(id: number, url: string, title: string) {
  return {
    type: UPDATE_TAB,
    id: id,
    url: url,
    title: title
  }
}
