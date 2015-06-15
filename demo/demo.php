<!DOCTYPE html>
<html>
<head>
    <title>Ping++ One Demo</title>
</head>
<body>
    <button id="pay">点此调起壹收款</button>
</body>
<script type="text/javascript">
    !function(){var c,d,a="http://192.168.1.112/assets/js/modules/one/index.js",b="https://dashboard.pingxx.com/assets/js/lib/seajs/sea.js";void 0===window.seajs&&(c=document.createElement("script"),c.src=b,c.type="text/javascript",document.body.appendChild(c),c.onload=function(){seajs.use(a,function(a){window.pingpp_one=a("./init")})}),d=function(){},d.prototype.init=function(a,b){var a=a,b=b;pingpp_one.init(a,b)},d.prototype.success=function(c,d){function e(){seajs.use(a,function(a){var b=a("./success");b.init(c,d)})}var f;c=c,d=d,void 0===window.seajs?(f=document.createElement("script"),f.src=b,f.type="text/javascript",document.body.appendChild(f),f.onload=function(){e()}):e()},window.pingpp_pay=new d}();
</script>
<script type="text/javascript">
    document.getElementById('pay').addEventListener('touchend',function(){
        pingpp_one.init({
            version:2,
            app_id:'app_1234567890',
            order_no:'no_1234567890',
            price:10,
            channel:['alipay_wap','wx_pub','upacp_wap','jdpay_wap','bfb_wap'],
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