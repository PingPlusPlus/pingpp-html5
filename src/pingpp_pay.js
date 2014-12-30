var PINGPP_PAY_SDK = window.PINGPP_PAY_SDK || {};

PINGPP_PAY_SDK.VERSION = '2.0.0';
const PINGPP_NOTIFY_URL = 'https://api.pingxx.com/notify/charges/';
const UPACP_WAP_URL = 'https://gateway.95516.com/gateway/api/frontTransReq.do';
const ALIPAY_WAP_URL = 'http://wappaygw.alipay.com/service/rest.htm?_input_charset=utf-8';
const UPMP_WAP_URL = 'uppay://uppayservice/?style=token&paydata=';
const BFB_SUCCESS = '<html><head><meta name="VIP_BFB_PAYMENT" content="BAIFUBAO"></head><body></body></html>';
PINGPP_PAY_SDK._resultCallback;
PINGPP_PAY_SDK.createPayment = function (charge_json, callback) {
    if (typeof callback == "function") {
        PINGPP_PAY_SDK._resultCallback = callback;
    }
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

    function stringify_data(data) {
        var output = [];
        for (var i in data) {
            if (i == 'url') {
                continue;
            }
            output.push(i + '=' + data[i]);
        }
        return output.join('&');
    }
    var charge;
    if(typeof charge_json == "string"){
        try{
            charge = JSON.parse(charge_json);
        }catch(err){
            PINGPP_PAY_SDK._innerCallback("fail", PINGPP_PAY_SDK._error("json_decode_fail"));
            return;
        }
    }else{
        charge = charge_json;
    }
    if(typeof charge == "undefined"){
        PINGPP_PAY_SDK._innerCallback("fail", PINGPP_PAY_SDK._error("json_decode_fail"));
        return;
    }
    if(!charge.hasOwnProperty('id')){
        PINGPP_PAY_SDK._innerCallback("fail", PINGPP_PAY_SDK._error("invalid_charge", "no_charge_id"));
        return;
    }
    if(!charge.hasOwnProperty('channel')){
        PINGPP_PAY_SDK._innerCallback("fail", PINGPP_PAY_SDK._error("invalid_charge", "no_channel"));
        return;
    }
    if(!charge.hasOwnProperty('livemode')){
        PINGPP_PAY_SDK._innerCallback("fail", PINGPP_PAY_SDK._error("invalid_charge", "no_livemode"));
        return;
    }
    if(!charge.hasOwnProperty('credential')){
        PINGPP_PAY_SDK._innerCallback("fail", PINGPP_PAY_SDK._error("invalid_charge", "no_credential"));
        return;
    }
    var credential = charge.credential;
    if(charge['livemode'] == false){
        var testmode_notify=function(ch_id){
            var request = new XMLHttpRequest();
            request.open('GET', PINGPP_NOTIFY_URL+ch_id+'?livemode=false', true);
            request.onload = function() {
                if (request.status < 200 || request.status >= 400 ) {
                    var extra = 'http_code:'+request.status+',response:'+request.responseText;
                    PINGPP_PAY_SDK._innerCallback("fail", PINGPP_PAY_SDK._error("testmode_notify_fail", extra));
                    return;
                }
                if (charge['channel'] == 'bfb_wap' && request.responseText == BFB_SUCCESS) {
                    PINGPP_PAY_SDK._innerCallback("success");
                    return;
                }
                if (request.responseText == "success") {
                    PINGPP_PAY_SDK._innerCallback("success");
                    return;
                }
                var extra = 'http_code:'+request.status+',response:'+request.responseText;
                PINGPP_PAY_SDK._innerCallback("fail", PINGPP_PAY_SDK._error("testmode_notify_fail", extra));
            };
            request.onerror = function() {
                PINGPP_PAY_SDK._innerCallback("fail", PINGPP_PAY_SDK._error("connection_error"));
            };
            request.send();
        }
        if (charge['channel'] == 'upmp_wap'
            || charge['channel'] == 'alipay_wap'
            || charge['channel'] == 'bfb_wap'
            || charge['channel'] == 'upacp_wap') {
            testmode_notify(charge['id']);
        } else {
            PINGPP_PAY_SDK._innerCallback("fail", PINGPP_PAY_SDK._error("invalid_charge", "no_such_channel:"+ charge['channel']));
        }
        return;
    }
    if (credential && credential.hasOwnProperty('upmp_wap')) {   // 调起银联支付控件，客户端需要安装银联支付控件才能调起
        var paydata = credential['upmp_wap']['paydata'];
        location.href = UPMP_WAP_URL + paydata;
    } else if (credential.hasOwnProperty(['upacp_wap'])) {
        form_submit(UPACP_WAP_URL, 'post', credential['upacp_wap']); // test url
    } else if (credential && credential.hasOwnProperty('alipay_wap')) {       // 调起支付宝手机网页支付
        credential['alipay_wap']['_input_charset'] = 'utf-8';
        form_submit(ALIPAY_WAP_URL, 'get', credential['alipay_wap']);
    } else if (credential && credential.hasOwnProperty('bfb_wap')) {
        if (!credential['bfb_wap'].hasOwnProperty('url')) {
            PINGPP_PAY_SDK._innerCallback("fail", PINGPP_PAY_SDK._error("invalid_credential", "missing_field: url"));
            return;
        }
        location.href = credential['bfb_wap']['url'] + '?' + stringify_data(credential['bfb_wap']);
    }
};

PINGPP_PAY_SDK.payment = PINGPP_PAY_SDK.createPayment;

PINGPP_PAY_SDK._innerCallback = function(result, err){
    if(typeof PINGPP_PAY_SDK._resultCallback == "function"){
        if(typeof err == "undefined"){
            err = PINGPP_PAY_SDK._error();
        }
        PINGPP_PAY_SDK._resultCallback(result, err);
        PINGPP_PAY_SDK._resultCallback = undefined;
    }
};

PINGPP_PAY_SDK._error = function(msg, extra){
    msg = (typeof msg == "undefined") ? "" : msg;
    extra = (typeof extra == "undefined") ? "" : extra;
    return {
        msg:msg,
        extra:extra
    };
};
