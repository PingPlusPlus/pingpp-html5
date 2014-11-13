var PINGPP_PAY_SDK = window.PINGPP_PAY_SDK || {};

PINGPP_PAY_SDK.payment = function (charge_json) {
    function form_submit(url, method, params) {
        var form = document.createElement("form");
        form.setAttribute("method", method);
        form.setAttribute("action", url);

        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                var hiddenField = document.createElement("input");
                hiddenField.setAttribute("type", "hidden");
                hiddenField.setAttribute("name", key);
                hiddenField.setAttribute("value", params[key]);
                form.appendChild(hiddenField);
            }
        }

        document.body.appendChild(form);
        form.submit();
    }

    var charge = JSON.parse(charge_json);
    var credential = charge.credential;

    if (charge.hasOwnProperty('livemode')) {
        if (charge['livemode'] == true) {
            if (credential && credential.hasOwnProperty('upmp_wap')) {   // 调起银联支付控件，客户端需要安装银联支付控件才能调起
                var paydata = credential['upmp_wap']['paydata'];
                var upmp_link = document.createElement("a");
                upmp_link.setAttribute('href', 'uppay://uppayservice/?style=token&paydata=' + paydata);
                upmp_link.style.display = 'none';
                document.body.appendChild(upmp_link);

                // 模拟链接点击事件
                var e = document.createEvent("MouseEvents");
                e.initEvent("click", true, true);
                upmp_link.dispatchEvent(e);
            } else if (credential.hasOwnProperty('alipay_wap')) {       // 调起支付宝手机网页支付
                credential['alipay_wap']['_input_charset'] = 'utf-8';
                form_submit('http://wappaygw.alipay.com/service/rest.htm?_input_charset=utf-8"', 'get', credential['alipay_wap']);
            }
        } else if (charge['livemode'] == false) {                       // 测试模式
            var testmode_notify=function(ch_id){
                var request = new XMLHttpRequest();
                request.open('GET', 'https://api.pingplusplus.com/notify/charges/'+ch_id+'?livemode=false', true);
                request.onload = function() {
                    if (request.status >= 200 && request.status < 400 && request.responseText == "success"){
                        alert('测试通过')
                    } else {
                        alert('测试失败')
                    }
                };
                request.onerror = function() {
                    alert('网络错误')
                };
                request.send();
            }
            if (credential.hasOwnProperty('upmp_wap') || credential.hasOwnProperty('alipay_wap')) {
                testmode_notify(charge['id']);
            } else {
                alert('错误 : 未知渠道')
            }
        }
    }
};