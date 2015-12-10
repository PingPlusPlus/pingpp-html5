# HTML5 「壹收款」接入指南

## 引用 pingpp_one.js

在你的购买页面内引用 pingpp_one.js 文件，放在 body 最后面

    <script type="text/javascript" src="https://one.pingxx.com/lib/pingpp_one.js"></script>

注意：页面需使用 HTML5 的 DOCTYPE 声明<!DOCTYPE html>。

## 调用壹收款 js 接口

1.在你的“购买”按钮点击事件中调用 pingpp_one.init 方法，确保以下代码放置在上面代码的后面，示例（以 id="pay" 的元素为例）：

        document.addEventListener('pingpp_one_ready',function(){
            document.getElementById('pay').addEventListener('click',function(){
                pingpp_one.init({
                    app_id:'app_1234567890',                     //该应用在 ping++ 的应用 ID
                    order_no:'no1234567890',                     //订单在商户系统中的订单号
                    amount:10,                                   //订单价格，单位：人民币 分
                    // 壹收款页面上需要展示的渠道，数组，数组顺序即页面展示出的渠道的顺序
                    // upmp_wap 渠道在微信内部无法使用，若用户未安装银联手机支付控件，则无法调起支付
                    channel:['alipay_wap','wx_pub','upacp_wap','yeepay_wap','jdpay_wap','bfb_wap'],
                    charge_url:'http://127.0.0.1/createCharge',  //商户服务端创建订单的 url
                    charge_param:{a:1,b:2},                      //(可选，用户自定义参数，若存在自定义参数则壹收款会通过 POST 方法透传给 charge_url)
                    open_id:'wx1234567890',                      //(可选，使用微信公众号支付时必须传入)
                    debug:true                                   //(可选，debug 模式下会将 charge_url 的返回结果透传回来)
                },function(res){
                    //debug 模式下获取 charge_url 的返回结果
                    if(res.debug&&res.chargeUrlOutput){
                        console.log(res.chargeUrlOutput);
                    }
                    if(!res.status){
                        //处理错误
                        alert(res.msg);
                    }
                    else{
                        //debug 模式下调用 charge_url 后会暂停，可以调用 pingpp_one.resume 方法继续执行
                        if(res.debug&&!res.wxSuccess){
                            if(confirm('当前为 debug 模式，是否继续支付？')){
                                pingpp_one.resume();
                            }
                        }
                        //若微信公众号渠道需要使用壹收款的支付成功页面，则在这里进行成功回调，
                        //调用 pingpp_one.success 方法，你也可以自己定义回调函数
                        //其他渠道的处理方法请见第 2 节
                        else pingpp_one.success(function(res){
                            if(!res.status){
                                alert(res.msg);
                            }
                        },function(){
                            //这里处理支付成功页面点击“继续购物”按钮触发的方法，
                            //例如：若你需要点击“继续购物”按钮跳转到你的购买页，
                            //则在该方法内写入 window.location.href = "你的购买页面 url"
                            window.location.href='http://yourdomain.com/payment_succeeded';//示例
                        });
                    }
                });
            });
        });

注意，charge_url 需要商户自己开发，该接口需要接收壹收款的 POST 参数，如果用户在上述方法中传入了自定义参数，则壹收款会将自定义参数一并 POST，格式为 JSON 字符串，结构如下：

    {
        "channel":"alipay_wap",
        "amount":10,
        "order_no":"no1234567890",
        "open_id":"Q7Xr3Te3aseda8NT6gVfivddSK1p",
        "a":1,
        "b":2
    }

只有微信公众号支付时会传 open_id 字段。charge_url 需要将 Ping++ API 的返回内容原样返回给壹收款。

若订单创建成功，则跳转至对应渠道的支付页面进行支付，支付成功后，会跳转到创建 charge 时定义的 result_url 或者 success_url (微信公众号的回调方法壹收款会自动处理,跳转到壹收款成功页面)。如果用户取消支付，则会跳转到 result_url 或者 cancel_url（具体情况根据渠道不同会有所变化）。

2.若要使用壹收款的支付成功页面，则需要在支付成功页面（即创建订单时 result_url 或 success_url 对应的页面）以创建 DOM 的方式引用 pingpp_one.js，将以下代码放在 body 的最后面，之后调用 pingpp_one.success 接口, success 接口的第二个参数为支付成功页面点击“继续购物”按钮触发的方法，例如：若你需要点击“继续购物”按钮跳转到你的购买页，则在该方法内写入 window.location.href = "你的购买页面 url"。

    <script type="text/javascript">
        var script=document.createElement('script');
        script.type='text/javascript';
        script.src='https://one.pingxx.com/lib/pingpp_one.js';
        script.onload=function(){
            document.addEventListener('pingpp_one_ready',function(){
                pingpp_one.success(function(res){
                    if(!res.status){
                        alert(res.msg);
                    }
                },function(){
                    window.location.href="http://pingxx.com";   //示例
                });
            });
        };
        document.body.appendChild(script);
    </script>

### 微信公众号接入注意事项

以下示例中，Server-SDK 以 PHP 为例，其他语言请参考各语言 SDK 的文档

#### 关于 openid

1.使用 Server-SDK 取得 openid（微信公众号授权用户唯一标识）

*先跳转到微信获取 授权 code，地址由下方代码生成，$wx_app_id 是你的微信公众应用唯一标识，$redirect_url 是用户确认授权后跳转的地址，用来接收 code

    <?php
    $url = \Pingpp\WxpubOAuth::createOauthUrlForCode($wx_app_id, $redirect_url);
    header('Location: ' . $url);

*用户确认授权后，使用 code 获取 openid，其中 $wx_app_secret 是你的微信公众号应用密钥,openid 在调用壹收款 pingpp_one.init 接口时传入

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

#### 在微信客户端中使用支付宝手机网页支付（alipay_wap）

你需要把 alipay_in_weixin 目录下的两个文件分别放到你的服务器目录，确保 ap.js 和 pay.htm 放在你需要使用支付宝的页面的同级目录下。

*参考 [支付宝网站的解决方案](https://cshall.alipay.com/enterprise/help_detail.htm?help_id=524702)。

