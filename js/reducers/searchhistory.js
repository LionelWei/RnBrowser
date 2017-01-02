/* @flow */

const SEARCH_HISTORY_APPEND = 'SEARCH_HISTORY_APPEND'
const SEARCH_HISTORY_REMOVE = 'SEARCH_HISTORY_REMOVE'

const initialState = {
  list: []
}

export default function reducer (state: any = initialState, action: any) {
  switch (action.type) {
    case SEARCH_HISTORY_APPEND:
      if (state.list && state.list.includes(action.id)) {
        var newState = {
          ...state
        }
        var i = newState.list.indexOf(action.id);
        newState.list.splice(i, 1)
        newState.list.splice(0, 0, action.id)
        return newState
      } else {
        return {
          ...state,
          list: [
            ...state.list,
            action.id
          ]
        }
      }
    case SEARCH_HISTORY_REMOVE:
      return {
        ...state,
        // value: state.list.remove(action.id)
      }
    default:
      return state
  }
}

export function append (id: number) {
  return {
    type: SEARCH_HISTORY_APPEND,
    id
  }
}

export function remove (id: number) {
  return {
    type: SEARCH_HISTORY_REMOVE,
    id
  }
}
