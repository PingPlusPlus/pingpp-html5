# 微信公众号 SDK
---------------
## 注意
**JS 文件已经与 [HTML5 SDK](https://github.com/PingPlusPlus/pingpp-html5) 合并，请使用合并后的 SDK。**
## 接入方法
1. 用 Server-SDK 取得 `openid`(微信公众号授权用户唯一标识)，以 php 为例
    - 先跳转到微信获取`授权 code`，地址由下方代码生成，`$wx_app_id` 是你的`微信公众号应用唯一标识`，`$redirect_url` 是用户确认授权后跳转的地址，用来接收 `code`
    ```php
    <?php
    require_once('Pingpp.php');
    $url = WxpubOAuth::createOauthUrlForCode($wx_app_id, $redirect_url);
    header('Location: ' . $url);
    ```
    - 用户确认授权后，使用 `code` 获取 `openid`，其中 `$wx_app_secret` 是你的`微信公众号应用密钥`
    ```php
    <?php
    require_once('Pingpp.php');
    $code = $_GET['code'];
    $openid = WxpubOAuth::getOpenid($wx_app_id, $wx_app_secret, $code);
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
        "trade_type": "JSAPI",
        "open_id":    openid
      }
    }
    ```
3. 得到 `charge` 后，在页面中引用 `pingpp_pay.js`，调用 `pingpp.createPayment`

    ```jsw
    pingpp.createPayment(charge, function(result, err){
        if(result=="success"){
            // payment succeed
        } else {
            console.log(result+" "+err.msg+" "+err.extra);
        }
    });
    ```
