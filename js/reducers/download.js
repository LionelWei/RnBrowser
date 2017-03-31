// @flow

const DOWNLOAD_START = "DOWNLOAD_START";
const DOWNLOAD_FINISH = "DOWNLOAD_FINISH";
const DOWNLOAD_REMOVE_ALL = "DOWNLOAD_REMOVE_ALL";;


/* 数据格式:
downloading:
{
  url,
  title,
  size,
  path,
}
download同上
*/

const initialState = {
  downloading: [], // 正在下载的列表
  downloaded: [], // 已经下载的列表
}

export default function reducer (state: any = initialState, action: any) {
  switch (action.type) {
    case DOWNLOAD_START:
      return handleDownloadStart(state, action);
    case DOWNLOAD_FINISH:
      return handleDownloadFinish(state, action);
    case DOWNLOAD_REMOVE_ALL:
      return handleDownloadRemoveAll(state, action);
    default:
      return state;
  }
}

function handleDownloadStart(state, action) {
  let url: string = action.url;
  if (~state.downloading.findIndex(e => e.url && e.url === url)) {
    return state;
  }
  return {
    ...state,
    downloading: [
      ...state.downloading,
      {
        url: action.url,
        title: action.title,
        path: action.path,
      }
    ]
  }
}

function handleDownloadFinish(state, action) {
  let url: string = action.url;
  if (~state.downloaded.findIndex(e => e.url && e.url === url)) {
    return state;
  }
  var newState = {
    ...state,
  };

  // 删除'正在下载'中的条目, 在已下载中添加条目
  let index = -1;
  newState.downloading.forEach((e, id) => {
    if (e.url === url) {
      index = id;
    }
  });
  if (~index) {
    newState.downloading.splice(index, 1);
  }

  var newDownloaded = newState.downloaded.unshift({
    url: action.url,
    title: action.title,
    path: action.path,
  })

  return {
    ...newState,
    newDownloaded,
  }
}

function handleDownloadRemoveAll(state, action) {
  return {
    ...state,
    downloading: [],
    downloaded: [],
  }
}

export function startDownload(url: string, title: string, path: string) {
  return {
    type: DOWNLOAD_START,
    url: url,
    title: title,
    path: path,
  }
}

export function finishDownload(url: string, title: string, path: string) {
  return {
    type: DOWNLOAD_FINISH,
    url: url,
    title: title,
    path: path,
  }
}

export function removeAllDownload () {
  return {
    type: DOWNLOAD_REMOVE_ALL,
  }
}
