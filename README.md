# Pingpp HTML5 SDK
---------------

## 简介
src 目录中是 HTML5 SDK 文件；<br>
example-wap 目录里是基于手机浏览器的接入示例；<br>
example-webview 目录里是 webview 的示例项目，包括 iOS 和 Android。

## 接入方法
1. 在你的页面中引入 [pingpp_pay.js](/src/pingpp_pay.js)

  ``` html
  <script src="/path/to/pingpp_pay.js"></script>
  ```

2. 根据 [接入指引](https://pingxx.com/guidance/firstCharge?serverSDK) 和 [API 文档](https://pingxx.com/document/api#api-c-new) 创建 `charge`，取得 `charge` 后，调用 `js` 接口
  ``` js
  pingpp.createPayment(charge, function(result, err){
    // 处理错误信息
  });
  ```
  如果 `charge` 正确的话，会跳转到相应的支付页面，要求用户进行付款。

3. 用户支付成功后，会跳转到创建 `charge` 时定义的 `result_url` 或者 `success_url`。如果用户取消支付，则会跳转到 `result_url` 或者 `cancel_url`（具体情况根据渠道不同会有所变化）。

## 微信公众号 SDK 接入注意事项

_以下示例中，Server-SDK 以 `php` 为例，其他语言请参考各语言 SDK 的文档_

### 关于 openid
1. 用 Server-SDK 取得 `openid`(微信公众号授权用户唯一标识)
  - 先跳转到微信获取`授权 code`，地址由下方代码生成，`$wx_app_id` 是你的`微信公众号应用唯一标识`，`$redirect_url` 是用户确认授权后跳转的地址，用来接收 `code`

  ```php
  <?php
  $url = \Pingpp\WxpubOAuth::createOauthUrlForCode($wx_app_id, $redirect_url);
  header('Location: ' . $url);
  ```
  - 用户确认授权后，使用 `code` 获取 `openid`，其中 `$wx_app_secret` 是你的`微信公众号应用密钥`
  ```php
  <?php
  $code = $_GET['code'];
  $openid = \Pingpp\WxpubOAuth::getOpenid($wx_app_id, $wx_app_secret, $code);
  ```
2. 将 `openid` 作为创建 `charge` 时的 `extra` 参数，具体方法参考[技术文档](https://pingxx.com/document/api/#api-c-new)，例：

  ```js
  {
    "order_no":  "1234567890",
    "app":       {"id": "app_1234567890abcDEF"},
    "channel":   "wx_pub",
    "amount":    100,
    "client_ip": "127.0.0.1",
    "currency":  "cny",
    "subject":   "Your Subject",
    "body":      "Your Body",
    "extra": {
      "open_id":    openid
    }
  }
  ```
3. 得到 `charge` 后，在页面中引用 `pingpp_pay.js`，调用 `pingpp.createPayment`，结果会直接在 `callback` 中返回。

  ```js
  pingpp.createPayment(charge, function(result, err) {
      if (result=="success") {
          // payment succeed
      } else {
          console.log(result+" "+err.msg+" "+err.extra);
      }
  });
  ```

### 使用微信 JS-SDK
如果使用微信 JS-SDK 来调起支付，需要在创建 `charge` 后，获取签名（`signature`），传给 HTML5 SDK。

```php
$jsapi_ticket_arr = \Pingpp\WxpubOAuth::getJsapiTicket($wx_app_id, $wx_app_secret);
$ticket = $jsapi_ticket_arr['ticket'];
```
**正常情况下，`jsapi_ticket` 的有效期为 7200 秒。由于获取 `jsapi_ticket` 的 api 调用次数非常有限，频繁刷新 `jsapi_ticket` 会导致 api 调用受限，影响自身业务，开发者必须在自己的服务器全局缓存 `jsapi_ticket`。**
```php
$signature = \Pingpp\WxpubOauth::getSignature($charge, $ticket);
```
然后在 HTML5 SDK 里调用
```js
pingpp.createPayment(charge, callback, signature, false);
```

## 在微信客户端中使用支付宝手机网页支付（`alipay_wap`）
你需要把 [alipay_in_weixin](/alipay_in_weixin) 目录下的两个文件分别放到你的服务器目录。

`ap.js` 只需要在需要调用支付宝的网页中引入
``` html
<script src="/path/to/ap.js"></script>
```
`pay.htm` 要放到你需要使用支付宝的页面的同级目录下。

- 参考 [支付宝网站的解决方案](https://cshall.alipay.com/enterprise/help_detail.htm?help_id=524702)