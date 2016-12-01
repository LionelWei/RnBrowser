/* @flow */

const CAN_NAVIGATE = 'CAN_NAVIGATE'
const PROG_WEBSITE_INFO = 'PROG_WEBSITE_INFO'

const initialState = {
  tabId: 0,
  url: '',
  title: '',
  loading: false,
  canBack: false,
  canForward: false
}

export default function reducer (state: any = initialState, action: any) {
  console.log('webnavigator type: ' + action.type);
  switch (action.type) {
    case CAN_NAVIGATE:
      return {
        ...state,
        canBack: action.canBack,
        canForward: action.canForward
      }
    case PROG_WEBSITE_INFO:
      return {
        ...state,
        tabId: action.tabId,
        url: action.url,
        title: action.title,
        canBack: action.canBack,
        canForward: action.canForward
      }
    default:
      return state
  }
}

export function progWebState(id: number,
                            canBack: bool,
                            canForward: bool,
                            url: string,
                            title: string) {
  return {
    type: PROG_WEBSITE_INFO,
    tabId: id,
    url: url,
    title: title,
    canBack: canBack,
    canForward: canForward
  }
}

export function canNavigate(canBack: bool, canForward: bool) {
  return {
    type: CAN_NAVIGATE,
    canBack: canBack,
    canForward: canForward
  }
}
