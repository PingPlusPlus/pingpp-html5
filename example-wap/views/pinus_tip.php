 <!DOCTYPE html>
 <html lang="en">
 <head>
 	<meta charset="UTF-8">
 	<meta name="viewport" content="width=device-width,initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
 	<title>MiniCheckout</title>
 	<link rel="stylesheet" type="text/css" href="../styles/pinus.css">
 </head>
 <body>
 <header>
	<div class="h_content">
		<span></span>	
	</div>
</header>
<section class="block">
	<div class="content2">
		<div class="app">
			<span class="pay_tip"><?php getResult(); ?></span>
			<label class="text_amount">
			</label>
			<div class="btn_bar"><a class="btn" href="pinus.html">确 定</a></div>
		</div>
	</div>
</section>


 <?php
function getResult()
{
    if(isset($_GET['code']))
    {
        echo '银联：';
        $code = $_GET['code'];
        if($code == 0)
        {
            echo '支付成功';
        }
        else if($code == 1)
        {
            echo '支付失败';
        }
        else if($code == -1)
        {
            echo '支付取消';
        }
        else
        {
            echo '未知错误('.$code.')';
        }
    }
    else
    {
        echo '支付宝：支付成功';
    }

}