const APPEND = 'APPEND'
const REMOVE = 'REMOVE'

const initialState = {
  list: [1, 2]
}

export default function reducer (state = initialState, action) {
  switch (action.type) {
    case APPEND:
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
    case REMOVE:
      return {
        ...state,
        // value: state.list.remove(action.id)
      }
    default:
      return state
  }
}

export function append (id) {
  return {
    type: APPEND,
    id
  }
}

export function remove (id) {
  return {
    type: REMOVE,
    id
  }
}
