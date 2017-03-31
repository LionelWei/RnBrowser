## code push常用指令

[官网指南](https://github.com/Microsoft/react-native-code-push#getting-started)

[中文参考文档1](http://www.jianshu.com/p/9e3b4a133bcc)

#### APP_NAME:
- Android: `cn.egame.browser-android`
- iOS: `cn.egame.browser-ios`


```
// 发布
// android
code-push release-react APP_NAME android -m --description
// ios
code-push release-react APP_NAME ios -m --description

// 查看部署
code-push deployment ls APP_NAME 列出应用的部署情况
// 查看历史版本
code-push deployment history APP_NAME <deploymentName> (Production 或者 Staging)
```
