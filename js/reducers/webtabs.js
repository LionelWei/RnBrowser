/* @flow */

import {printObj} from '../utils/Common'

const CREATE_TAB = 'CREATE_TAB'
const UPDATE_TAB = 'UPDATE_TAB'
const INIT_TAB = 'INIT_TAB'
const REMOVE_TAB = 'REMOVE_TAB'

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
    case REMOVE_TAB:
      return handleRemoveTab(state, action);
    default:
      var newState = firstValidState || initialState
      console.log('type: ' + action.type);
      console.log('tabs: ' + newState.tabs.length);
      return newState;

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
    return findTab(action.id)
          ? state
          : {
              tabs: [
                ...state.tabs,
                {
                  id: action.id
                }
              ]
            }
  }

  function findTab(tabId: number) {
    console.log('findTab: toFind: ' + tabId);
    for (var i in state.tabs) {
      if (state.tabs[i].id === tabId) {
        console.log('FOUND: ' + state.tabs[i].id + ', count: ' + state.tabs.length);
        return true;
      }
    }
    return false
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

function handleRemoveTab(state: any, action: any) {
  var newState = {...state};
  newState.tabs.splice(action.id, 1);
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

export function removeTab(id: number) {
  return {
    type: REMOVE_TAB,
    id: id,
  }
}
