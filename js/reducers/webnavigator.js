/* @flow */

const GO_BACK = 'GO_BACK'
const GO_FORWARD = 'GO_FORWARD'
const CAN_BACK = 'CAN_BACK'
const CAN_FORWARD = 'CAN_FORWARD'

const initialState = {
  back: false,
  forward: false,
  canBack: false,
  canForward: false
}

export default function reducer (state: any = initialState, action: any) {
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
    case CAN_BACK:
      return {
        initialState,
        canBack: true
      }
    case CAN_FORWARD:
      return {
        initialState,
        canForward: true
      }
    default:
      return state
  }
}

export function back () {
  return {
    type: GO_BACK
  }
}

export function forward () {
  return {
    type: GO_FORWARD
  }
}

export function canBack () {
  return {
    type: CAN_BACK
  }
}

export function canForward () {
  return {
    type: CAN_FORWARD
  }
}
