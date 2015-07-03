<!DOCTYPE html>
<html>
<head>
    <title>Ping++ One Demo</title>
</head>
<body>
    <button id="pay">点此调起壹收款</button>
</body>
<script type="text/javascript" src="https://one.pingxx.com/lib/pingpp_one.js"></script>
<script type="text/javascript">
    document.getElementById('pay').addEventListener('touchend',function(){
        pingpp_one.init({
            app_id:'app_1234567890',
            order_no:'no_1234567890',
            price:10,
            channel:['alipay_wap','wx_pub','upacp_wap','yeepay_wap','jdpay_wap','bfb_wap'],
            charge_url:'http://127.0.0.1/charge',
            open_id:'1234567890'
        },function(res){
            if(!res.status){
                alert(res.msg);
            }
        });
    });
</script>
</html>