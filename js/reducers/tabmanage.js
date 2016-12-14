/* @flow */

const SHOW_TAB_MANAGER = 'SHOW_TAB_MANAGER'
const UPDATE_TAB_THUMB_URIS = 'UPDATE_TAB_THUMB_URIS'

const initialState = {
  isTabManagerVisible: false,
  tabThumbUris: [],
}

export default function reducer (state: any = initialState, action: any) {
  switch (action.type) {
    case SHOW_TAB_MANAGER:
      return {
        ...state,
        isTabManagerVisible: action.isTabManagerVisible,
        tabThumbUris: !action.isTabManagerVisible ? [] : state.tabThumbUris
      };
    case UPDATE_TAB_THUMB_URIS:
      return {
        ...state,
        tabThumbUris: action.uris
      }
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

export function updateTabThumbUris(uris: Array<String>) {
  return {
    type: UPDATE_TAB_THUMB_URIS,
    uris: uris
  }
}
