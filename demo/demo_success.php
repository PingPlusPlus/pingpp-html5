<!DOCTYPE html>
<html>
<head>
    <title>Ping++ One Demo</title>
</head>
<body>
</body>
<script type="text/javascript">
    var script=document.createElement('script');
    script.type='text/javascript';
    script.src='https://one.pingxx.com/lib/pingpp_one.js';
    script.onload=function(){
        document.addEventListener('pingpp_one_ready',function(e){
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
</html>