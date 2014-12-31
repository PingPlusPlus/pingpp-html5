var PINGPP_WX_PUB = window.PINGPP_WX_PUB || {};
const PINGPP_NOTIFY_URL = 'https://api.pingxx.com/notify/charges/';
PINGPP_WX_PUB = {

  _jsApiParameters: {},

  _resultCallback: undefined,

  _jsApiCall: function(){
    if(PINGPP_WX_PUB._jsApiParameters != {}){
      WeixinJSBridge.invoke(
        'getBrandWCPayRequest',
        PINGPP_WX_PUB._jsApiParameters,
        function(res){
          if(res.err_msg == 'get_brand_wcpay_request:ok'){
            PINGPP_WX_PUB._innerCallback("success");
          }else if(res.err_msg == 'get_brand_wcpay_request:cancel'){
            PINGPP_WX_PUB._innerCallback("cancel");
          }else{
            PINGPP_WX_PUB._innerCallback("fail", PINGPP_WX_PUB._error("wx_result_fail", res.err_msg));
          }
        }
      );
    }
  },

  _callpay: function(){
    if (typeof WeixinJSBridge == "undefined"){
      if(document.addEventListener){
        document.addEventListener('WeixinJSBridgeReady', PINGPP_WX_PUB._jsApiCall, false);
      }else if(document.attachEvent){
        document.attachEvent('WeixinJSBridgeReady', PINGPP_WX_PUB._jsApiCall); 
        document.attachEvent('onWeixinJSBridgeReady', PINGPP_WX_PUB._jsApiCall);
      }
    }else{
      PINGPP_WX_PUB._jsApiCall();
    }
  },

  _innerCallback: function(result, err){
    if(typeof PINGPP_WX_PUB._resultCallback == "function"){
      if(typeof err == "undefined"){
        err = PINGPP_WX_PUB._error();
      }
      PINGPP_WX_PUB._resultCallback(result, err);
    }
  },

  createPayment: function(charge_json, callback){
    if(typeof callback != "function"){
      return false;
    }
    PINGPP_WX_PUB._resultCallback = callback;
    var charge;
    if(typeof charge_json == "string"){
      try{
        charge = JSON.parse(charge_json);
      }catch(err){
        PINGPP_WX_PUB._innerCallback("fail", PINGPP_WX_PUB._error("json_decode_fail"));
        return;
      }
    }else{
      charge = charge_json;
    }
    if(typeof charge != "undefined"){
      if(!charge.hasOwnProperty('id')){
        PINGPP_WX_PUB._innerCallback("fail", PINGPP_WX_PUB._error("invalid_charge", "no_charge_id"));
        return;
      }
      if(!charge.hasOwnProperty('livemode')){
        PINGPP_WX_PUB._innerCallback("fail", PINGPP_WX_PUB._error("invalid_charge", "no_livemode"));
        return;
      }
      if(charge['livemode'] == false){
        PINGPP_WX_PUB._testModeNotify(charge['id']);
        return;
      }
      if(!charge.hasOwnProperty('credential')){
        PINGPP_WX_PUB._innerCallback("fail", PINGPP_WX_PUB._error("invalid_charge", "no_credential"));
        return;
      }
      var credential = charge['credential'];
      if(credential&&credential.hasOwnProperty('wx_pub')){
        var fields = ["appId", "timeStamp", "nonceStr", "package", "signType", "paySign"];
        for(var k in fields){
          if(!credential['wx_pub'].hasOwnProperty(fields[k])){
            PINGPP_WX_PUB._innerCallback("fail", PINGPP_WX_PUB._error("invalid_credential", "missing_field_"+fields[k]));
            return;
          }
        }
        PINGPP_WX_PUB._jsApiParameters = credential['wx_pub'];
        PINGPP_WX_PUB._callpay();
      }
    } else {
      PINGPP_WX_PUB._innerCallback("fail", PINGPP_WX_PUB._error("invalid_charge"));
      return;
    }
  },

  _error: function(msg, extra){
    msg = (typeof msg == "undefined") ? "" : msg;
    extra = (typeof extra == "undefined") ? "" : extra;
    return {
      msg:msg,
      extra:extra
    };
  },

  // TESTMODE
  _testModeNotify: function(charge_id){
    var request = new XMLHttpRequest();
    request.open('GET', PINGPP_NOTIFY_URL+charge_id+'?livemode=false', true);
    request.onload = function() {
      if (request.status >= 200 && request.status < 400 && request.responseText == "success"){
        PINGPP_WX_PUB._innerCallback("success");
      } else {
        var extra = 'http_code:'+request.status+',response:'+request.responseText;
        PINGPP_WX_PUB._innerCallback("fail", PINGPP_WX_PUB._error("testmode_notify_fail", extra));
      }
    };
    request.onerror = function() {
      PINGPP_WX_PUB._innerCallback("fail", PINGPP_WX_PUB._error("network_err"));
    };
    request.send();
  }
};
