# Pingpp HTML5 SDK
---------------

## 简介
 src 文件夹中是 HTML5 SDK 文件，example-wap 文件夹里是基于手机浏览器的接入示例 ；example-webview 文件夹里是基于 webview 的接入示例，在该文件夹中 Android 文件夹下是 Android 下的 webview 的示例 ，iOS 文件夹里是 iOS 下的 webview 的示例。

## 接入方法
详细请参见 [技术文档](https://pingxx.com/document) 和 示例代码。如果还有疑惑，请联系 Ping++ 寻求帮助。

## 微信公众号 SDK 接入方法
请查看 [wxpub](https://github.com/PingPlusPlus/pingpp-html5/tree/master/wxpub)

## 更新日志
### 2.0.2
* 更改：<br>
修正微信公众号 JSAPI 未加载完成时调用的问题

### 2.0.1
* 更改：<br>
新的测试模式<br>
合并 HTML5 和 微信公众号 SDK

### 2.0.0
* 更改：<br>
添加新渠道：百付宝WAP<br>
调用方法添加 callback，未跳转渠道前，出错时可返回错误信息