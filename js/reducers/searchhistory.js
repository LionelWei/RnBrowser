/* @flow */

const SEARCH_HISTORY_APPEND = 'SEARCH_HISTORY_APPEND'
const SEARCH_HISTORY_REMOVE = 'SEARCH_HISTORY_REMOVE'
const SEARCH_HISTORY_REMOVE_ALL = 'SEARCH_HISTORY_REMOVE_ALL'

const initialState = {
  list: []
}

export default function reducer (state: any = initialState, action: any) {
  switch (action.type) {
    case SEARCH_HISTORY_APPEND:
      console.log('search state: ');
      console.log(JSON.stringify(state, null, 2));
      var i = state.list.findIndex(e => e.url === action.url)
      if (~i) {
        var newState = {
          ...state
        }
        newState.list.splice(i, 1)
        newState.list.splice(0, 0, {
          url: action.url,
          isWebUrl: action.isWebUrl
        })
        return newState
      } else {
        return {
          ...state,
          list: [
            {
              url: action.url,
              isWebUrl: action.isWebUrl
            },
            ...state.list,
          ]
        }
      }
    case SEARCH_HISTORY_REMOVE:
      return {
        ...state,
        // value: state.list.remove(action.url)
      }
    case SEARCH_HISTORY_REMOVE_ALL:
      return {
        ...state,
        list: []
      }
    default:
      return state
  }
}

export function append (url: string, isWebUrl: bool) {
  return {
    type: SEARCH_HISTORY_APPEND,
    url,
    isWebUrl,
  }
}

export function remove (url: string) {
  return {
    type: SEARCH_HISTORY_REMOVE,
    url
  }
}

export function removeAll () {
  return {
    type: SEARCH_HISTORY_REMOVE_ALL,
  }
}
