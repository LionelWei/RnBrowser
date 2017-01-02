// @flow

const DOWNLOAD_START = "DOWNLOAD_START"
const DOWNLOAD_FINISH = "DOWNLOAD_FINISH"


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
    default:
      return state;
  }
}

function handleDownloadStart(state, action) {
  let url: string = action.url;
  if (state.downloading.filter(e => e.url && e.url === url).length > 0) {
    return;
  }
  return {
    ...state,
    downloading: [
      ...state.downloading,
      {
        url: action.url,
        title: action.title,
      }
    ]
  }
}

function handleDownloadFinish(state, action) {
  let url: string = action.url;
  if (state.downloaded.filter(e => e.url && e.url === url).length > 0) {
    // return;
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
  if (index !== -1) {
    newState.downloading.splice(index, 1);
  }

  return {
    ...newState,
    downloaded: [
      ...state.downloaded,
      {
        url: action.url,
        title: action.title,
      }
    ]
  }
}

export function startDownload(url: string, title: string) {
  return {
    type: DOWNLOAD_START,
    url: url,
    title: title,
  }
}

export function finishDownload(url: string, title: string) {
  return {
    type: DOWNLOAD_FINISH,
    url: url,
    title: title,
  }
}
