const SUBSCRIBE = 'SUBSCRIBE'
const UNSUBSCRIBE = 'UNSUBSCRIBE'
const INCRAESE = 'INCRAESE'

const initialState = {
  value: 10
}

export default function reducer (state = initialState, action) {
  console.log('action type: ' + action.type + ', state value: ' + state.value);
  switch (action.type) {
    case INCRAESE:
      return {
        ...state,
        value: state.value + 1
      }
    default:
      return state
  }
}

export function subscribe (id) {
  return {
    type: SUBSCRIBE,
    id
  }
}

export function increase (id) {
  return {
    type: INCRAESE,
    id
  }
}

export function unsubscribe (id) {
  return {
    type: UNSUBSCRIBE,
    id
  }
}
