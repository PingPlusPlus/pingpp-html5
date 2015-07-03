<!DOCTYPE html>
<html>
<head>
    <title>Ping++ One Demo</title>
</head>
<body>
</body>
<script type="text/javascript" src="https://one.pingxx.com/lib/pingpp_one.js"></script>
<script type="text/javascript">
    pingpp_one.success(function(res){
        if(!res.status){
            alert(res.msg);
        }
    },function(){
        window.location.href='https://pingxx.com';
    });
</script>
</html>