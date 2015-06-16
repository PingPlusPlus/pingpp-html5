
#Pingpp 壹收款 HTML5 SDK

##使用方法

1.在你的购买页面底部(</html>标签之前)引用 pingpp_one.js。

    <script type="text/javascript" src="http://one.pingxx.com/lib/pingpp_one.js"></script>

2.为你的购买按钮添加事件，确保以下代码放置在上面代码的后面。其中，

    <script type="text/javascript">
        document.getElementById(yourElement).addEventListener('touchend',function(){
            pingpp_one.init({
                app_id:'app_1234567890',                    //该应用在ping++的应用ID
                order_no:'no_1234567890',                   //订单在商户系统中的订单号
                price:10,                                   //订单价格，单位：人民币 分
                channel:['alipay_wap','wx_pub','upacp_wap','jdpay_wap','bfb_wap'],  //壹收款页面上需要展示的渠道，数组，数组顺序即页面展示出的渠道的顺序
                charge_url:'http://127.0.0.1/createCharge', //创建订单的url,不带任何参数
                open_id:'wx1234567890'                      //(可选，使用微信公众号支付时必须传入)
            },function(res){
                if(!res.status){
                    alert(res.msg);//处理错误
                }
            });
        });
    </script>

若订单创建成功，则跳转至对应渠道的支付页面进行支付，支付成功后，会跳转到创建 charge 时定义的 result_url 或者 success_url。如果用户取消支付，则会跳转到 result_url 或者 cancel_url（具体情况根据渠道不同会有所变化）。

3.若要使用壹收款的支付成功页面，则需要在支付成功页面（即创建订单时 result_url 或 success_url 对应的页面）以第一步同样地方式引用 pingpp_one.js，之后调用 pingpp_one.success 接口,success 方法的第二个参数为支付成功页面点击“继续购物”按钮触发的方法，例如：若你需要点击“继续购物”按钮跳转到你的购买页，则在该方法内写入 window.location.href = "你的购买页面url"。

    <script type="text/javascript">
        pingpp_one.success(function(res){
            if(!res.status){
                alert(res.msg);
            }
        },function(){
            //do something
            //for example:
            window.location.href="http://pingxx.com";
        });
    </script>

##微信公众号 SDK 接入注意事项

以下示例中，Server-SDK 以 PHP 为例，其他语言请参考各语言 SDK 的文档

###关于 openid

1.使用 Server-SDK 取得 openid（微信公众号授权用户唯一标识）

*先跳转到微信获取 授权 code，地址由下方代码生成，$wx_app_id 是你的微信公众应用唯一标识，$redirect_url 是用户确认授权后跳转的地址，用来接收 code

    <?php
    $url = \Pingpp\WxpubOAuth::createOauthUrlForCode($wx_app_id, $redirect_url);
    header('Location: ' . $url);

*用户确认授权后，使用 code 获取 openid，其中 $wx_app_secret 是你的微信公众号应用密钥,openid 在调用壹收款 pingpp_pay.init 接口时传入

    <?php
    $code = $_GET['code'];
    $openid = \Pingpp\WxpubOAuth::getOpenid($wx_app_id, $wx_app_secret, $code);

2.将 openid 作为创建 charge 时的 extra 参数，具体方法参考技术文档，例：

    {
        "order_no":"1234567890",
        "app":{"id":"app_1234567890abcd"},
        "channel":"wx_pub",
        "amount":100,
        "client_ip":"127.0.0.1",
        "currency":"cny",
        "subject":"your subject",
        "body":"your body",
        "extra":{
            "open_id":$openid
        }
    }

3.由于微信公众号支付只能在微信 webview 中使用，所以你需要在你的页面中判断页面是否在微信 webview 中打开，若在微信 webview 中打开，则在调用 pingpp_one.init 接口时必须传入 open_id 参数，在微信外部打开页面时，壹收款会自动屏蔽微信支付渠道。

##在微信客户端中使用支付宝手机网页支付（alipay_wap）
你需要把 alipay_in_weixin 目录下的两个文件分别放到你的服务器目录，确保 ap.js 和 pay.htm 放在你需要使用支付宝的页面的同级目录下。

*参考 [支付宝网站的解决方案](https://cshall.alipay.com/enterprise/help_detail.htm?help_id=524702)。

