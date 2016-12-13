const SHOW_TAB_MANAGER = 'SHOW_TAB_MANAGER'
const SHOW_TAB_PAGE = "SHOW_TAB_PAGE"
const UPDATE_WEBSITE_INFO = 'UPDATE_WEBSITE_INFO'
const CREATE_TAB = 'CREATE_TAB'
const UPDATE_TAB = 'UPDATE_TAB'
const REMOVE_TAB = 'REMOVE_TAB'

const initialState = {
  isTabPageVisible: true, // 判断当前页面为标签页或网页
  tabId: 0,   // 当前页面tab id
  url: '',    // 当前页面url
  title: '',  // 当前页面标题
  loading: false,
  canBack: false,  // 当前页面是否能后退
  canForward: false, // 当前页面是否能前进
  tabs: [], // tab信息汇总
}

var isFirstLaunch = true
var firstValidState;

export default function reducer (state: any = initialState, action: any) {
  console.log('tabinfo type: ' + action.type);
  switch (action.type) {
    case UPDATE_WEBSITE_INFO:
      return handleUpdateWebInfo(state, action);
    case SHOW_TAB_PAGE:
      return handleShowTabPage(state, action);
    case CREATE_TAB:
      return handleCreateTab(state, action);
    case UPDATE_TAB:
      return handleUpdateTab(state, action);
    case REMOVE_TAB:
      return handleRemoveTab(state, action);
    default:
      return state
  }
}

function handleUpdateWebInfo(state, action) {
  return {
    ...state,
    tabId: action.tabId,
    url: action.url,
    title: action.title ,
    canBack: action.canBack,
    canForward: action.canForward,
    isTabPageVisible: false,
  }
}

function handleShowTabPage(state, action) {
  return {
    ...state,
    isTabPageVisible: action.isTabPageVisible,
  }
}

function handleCreateTab(state: any = initialState, action: any) {
  if (isFirstLaunch) {
    isFirstLaunch = false
    firstValidState = {...initialState};
    firstValidState.tabs[action.id] = {
      id: action.id,
      title: '主页'
    }
    return firstValidState
  } else {
    return findTab(action.id)
          ? state
          : {
              ...state,
              isTabPageVisible: true,
              tabs: [
                ...state.tabs,
                {
                  id: action.id,
                  title: action.title || '主页'
                }
              ]
            }
  }

  function findTab(tabId: number) {
    for (var i in state.tabs) {
      if (state.tabs[i].id === tabId) {
        return true;
      }
    }
    return false
  }
}

function handleUpdateTab(state: any = initialState, action: any) {
  var newState = {
    ...state,
  };
  console.log('===== handleUpdateTab: ' + action.url + ', ' + action.title);
  newState.tabs[action.id] = {
    id: action.id,
    url: action.url,
    title: action.title,
  }
  return newState;
}

function handleRemoveTab(state: any, action: any) {
  var newState = {...state};
  console.log('handleRemoveTab: ' + action.id);
  newState.tabs.splice(action.id, 1);
  return newState;
}

export function updateWebState(id: number,
                            canBack: bool,
                            canForward: bool,
                            url: string,
                            title: string) {
  return {
    type: UPDATE_WEBSITE_INFO,
    tabId: id,
    url: url,
    title: title,
    canBack: canBack,
    canForward: canForward
  }
}

export function showTabPage(visible: bool) {
  return {
    type: SHOW_TAB_PAGE,
    isTabPageVisible: visible
  }
}

export function createTab(id: number) {
  return {
    type: CREATE_TAB,
    id: id,
  }
}

export function updateTab(id: number, url: string, title: string) {
  return {
    type: UPDATE_TAB,
    id: id,
    url: url,
    title: title
  }
}

export function removeTab(id: number) {
  return {
    type: REMOVE_TAB,
    id: id,
  }
}
