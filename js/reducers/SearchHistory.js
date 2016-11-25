const APPEND = 'APPEND'
const REMOVE = 'REMOVE'

const initialState = {
  list: [1, 2]
}

export default function reducer (state = initialState, action) {
  switch (action.type) {
    case APPEND:
      return {
        ...state,
        value: state.list.push(action.id)
      }
    case APPEND:
      return {
        ...state,
        value: state.list.remove(action.id)
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
