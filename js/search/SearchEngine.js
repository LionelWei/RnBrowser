// @flow

const BAIDU_PREFIX: string = 'http://www.baidu.com/s?wd=';

function getSearchUrl(keyword: string) {
  return BAIDU_PREFIX + keyword
}

module.exports = {getSearchUrl}
