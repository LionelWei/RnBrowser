// @flow

import * as IMG from '../../assets/imageAssets'

/*
爱游戏门户 微博   	网易 	      腾讯
淘宝			京东		快递100    苏宁易购
优酷			爱奇艺	 腾讯视频		哔哩哔哩
*/
module.exports = {
  MAIN_WEBSITES: [
    ['http://h5.play.cn', '在线玩', IMG.WEB_ICON_EGAME],
    ['http://weibo.com/', '微博', IMG.WEB_ICON_WEIBO],
    ['http://3g.163.com', '网易新闻', IMG.WEB_ICON_NETEASE],
    ['http://info.3g.qq.com/g/s?aid=index&g_ut=3&from=4g_qqcom', '腾讯门户', IMG.WEB_ICON_TENCENT_PORTAL],
    // ['https://m.baidu.com/?from=1013843a&pu=sz%401321_480&wpo=btmfast', '百度', IMG.WEB_ICON_BAIDU],
    ['http://m.kuaidi100.com', '快递100', IMG.WEB_ICON_KUAIDI100],
    ['https://m.taobao.com', '淘宝', IMG.WEB_ICON_TAOBAO],
    ['http://m.jd.com', '京东', IMG.WEB_ICON_JINGDONG],
    ['http://m.suning.com', '苏宁', IMG.WEB_ICON_SUNING],
    ['http://m.youku.com', '优酷', IMG.WEB_ICON_YOUKU],
    ['http://m.iqiyi.com', '爱奇艺', IMG.WEB_ICON_IQIYI],
    ['http://m.v.qq.com/', '腾讯视频', IMG.WEB_ICON_TENCENT_VIDEO],
    ['http://m.bilibili.com', '哔哩哔哩', IMG.WEB_ICON_BILIBILI],
  ]
}
