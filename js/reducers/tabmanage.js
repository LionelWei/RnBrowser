/* @flow */

const SHOW_TAB_MANAGER = 'SHOW_TAB_MANAGER'

const initialState = {
  isTabManagerVisible: false
}

export default function reducer (state: any = initialState, action: any) {
  switch (action.type) {
    case SHOW_TAB_MANAGER:
      return {
        ...state,
        isTabManagerVisible: action.isTabManagerVisible
      };
    default:
      return state;
  }
}

export function showTabManager(visible: bool) {
  return {
    type: SHOW_TAB_MANAGER,
    isTabManagerVisible: visible
  }
}
