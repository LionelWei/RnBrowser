/* @flow */

const GO_BACK = 'GO_BACK'
const GO_FORWARD = 'GO_FORWARD'
const CAN_NAVIGATE = 'CAN_NAVIGATE'

const initialState = {
  back: false,
  forward: false,
  canBack: false,
  canForward: false
}

export default function reducer (state: Object = initialState, action: Object) {
  console.log(state)
  switch (action.type) {
    case GO_BACK:
      return {
        initialState,
        back: true
      }
    case GO_FORWARD:
      return {
        initialState,
        forward: true
      }
    case CAN_NAVIGATE:
      return {
        initialState,
        canBack: action.canBack,
        canForward: action.canForward
      }
    default:
      return state
  }
}

export function back() {
  return {
    type: GO_BACK
  }
}

export function forward() {
  return {
    type: GO_FORWARD
  }
}

export function canNavigate(canBack: bool, canForward: bool) {
  return {
    type: CAN_NAVIGATE,
    canBack: canBack,
    canForward: canForward
  }
}
