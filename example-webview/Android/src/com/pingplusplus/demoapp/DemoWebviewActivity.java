package com.pingplusplus.demoapp;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ComponentName;
import android.content.Intent;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.webkit.*;
import android.widget.ProgressBar;
import android.widget.Toast;
import com.google.gson.Gson;
import com.pingplusplus.android.PaymentActivity;
import com.pingplusplus.android.PingppLog;
import com.squareup.okhttp.*;
import java.io.IOException;


/**
 * ping++ sdk 示例程序，仅供开发者参考。
 * 
 * 注意】运行该示例，需要用户填写一个CHARGE_URL，用来获取 charge 。还需要填写一个 WEBVIEW_URL 用来加载需要显示的 webview 页面
 * ping++ sdk 使用流程如下： 
 * 1）webview 网页上面的 js 调用 PINGPP_ANDROID_SDK.callPay方法，传入支付的 channel 和 amount 。 
 * 2）app 客户端根据 channel 和 amount 向CHARGE_URL请求服务端获得charge。
 * 服务端生成charge的方式参考ping++ 官方文档，地址https://pingxx.com/guidance/server/import 
 * 3）收到服务端的charge，调用ping++ sdk。 
 * 4）onActivityResult 中获得支付结构。 
 * 5）如果支付成功。服务端会收到ping++异步通知，支付成功依据服务端异步通知为准。
 * @author sunkai
 *
 */
public class DemoWebviewActivity extends Activity {
	/**
	 * 开发者需要填一个服务端 CHARGE_URL 该 CHARGE_URL 是用来请求支付需要的 charge 。务必确保，CHARGE_URL
	 * 能返回 json 格式的 charge 对象。 服务端生成 charge 的方式可以参考 ping++ 官方文档，地址
	 * https://pingxx.com/guidance/server/import
	 * 
	 * 【 http://218.244.151.190/demo/charge 】是 ping++ 为了方便开发者体验 sdk 而提供的一个临时 url
	 * 。 改 url 仅能调用【模拟支付控件】，开发者需要改为自己服务端的 url 。
	 */
	private static final String CHARGE_URL = "http://218.244.151.190/demo/charge";
	/**
	 * 开发者需要填写一个 WEBVIEW_URL，用来提供加载 webview 的页面。该页面可以通过
	 * PINGPP_ANDROID_SDK.callPay 调用 app 中的方法。 webvew
	 * 页面可以参考：https://github.com/PingPlusPlus
	 * /pingpp-html5/blob/master/example-wap/views/pinus_webview.html
	 * 
	 * 【 http://218.244.151.190/demo/webview.html 】是 ping++ 为了方便开发者体验 sdk 而提供的一个临时页面 。
	 * 开发者需要改为自己服务端的 页面地址 。
	 */
	private static final String WEBVIEW_URL = "http://218.244.151.190/demo/webview.html";

	private WebView webView;
	private ProgressBar progressBar;

	@SuppressLint("SetJavaScriptEnabled")
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.webview);
		PingppLog.DEBUG = true;
	
		/**
		 * 初始化进度条
		 */
		progressBar = (ProgressBar) findViewById(R.id.progressBar);
		progressBar.setMax(100);
		progressBar.setProgress(0);

		/**
		 * 初始化 webview
		 */
		webView = (WebView) findViewById(R.id.webview);
		webView.loadUrl(WEBVIEW_URL);

		WebSettings webSettings = webView.getSettings();
		webSettings.setJavaScriptEnabled(true);
		webView.setWebChromeClient(new MyWebViewClient());
		webView.setWebViewClient(new WebViewClient() {
			@Override
			public boolean shouldOverrideUrlLoading(WebView view, String url) {
				Log.i("url", url);
				if (url != null && url.startsWith("uppay://")) {
					view.getContext().startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
					return true;
				}

				return false;
			}
		});
		
		/**
		 * 设置 js 交互类
		 */
		webView.addJavascriptInterface(new JSInterface(), "PINGPP_ANDROID_SDK");
	}

	@Override
	public boolean onKeyDown(int keyCode, KeyEvent event) {
		if (webView.canGoBack() && keyCode == KeyEvent.KEYCODE_BACK) {
			webView.goBack();
			return true;
		}
		return super.onKeyDown(keyCode, event);
	}

	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		// 支付页面返回处理
		if (requestCode == 1) {
			if (resultCode == Activity.RESULT_OK) {
				String result = data.getExtras().getString("pay_result");

				/*
				 * 处理返回值 "success" - 支付成功 "fail" - 支付失败 "cancel" - 用户取消
				 * "invalid" - 未安装支付控件
				 */
				if (result.equalsIgnoreCase("success")) {
					webView.loadUrl("YOUR-WEBVIEW-RESULT-DOMAIN");
				}

				Toast.makeText(this, result, Toast.LENGTH_SHORT).show();
			} else if (resultCode == Activity.RESULT_CANCELED) {
				Toast.makeText(this, "User canceled", Toast.LENGTH_SHORT).show();
			}
		}
	}

	/**
	 * 请求支付凭据
	 * 
	 * @author sunkai
	 * 
	 */
	class PaymentTask extends AsyncTask<PaymentRequest, Void, String> {
		@Override
		protected String doInBackground(PaymentRequest... pr) {
			PaymentRequest paymentRequest = pr[0];
			String data = null;
			String json = new Gson().toJson(paymentRequest);
			try {
				// 向支付请求文件（例如 pay.php）请求数据
				data = postJson(CHARGE_URL, json);
			} catch (Exception e) {
				e.printStackTrace();
			}
			return data;
		}

		@Override
		protected void onPostExecute(String data) {
			Log.d("tag", data);
			Intent intent = new Intent();
			String packageName = getPackageName();
			ComponentName componentName = new ComponentName(packageName, packageName + ".wxapi.WXPayEntryActivity");
			intent.setComponent(componentName);
			intent.putExtra(PaymentActivity.EXTRA_CHARGE, data);
			startActivityForResult(intent, 1);
		}
	}

	/**
	 * http 请求
	 * 
	 * @param url
	 * @param json
	 * @return
	 * @throws IOException
	 */
	private static String postJson(String url, String json) throws IOException {
		MediaType type = MediaType.parse("application/json; charset=utf-8");
		RequestBody body = RequestBody.create(type, json);
		Request request = new Request.Builder().url(url).post(body).build();

		OkHttpClient client = new OkHttpClient();
		Response response = client.newCall(request).execute();

		return response.body().string();
	}

	/**
	 * 设置进度条
	 * 
	 * @param progress
	 */
	private void setValue(int progress) {
		this.progressBar.setProgress(progress);
	}

	/**
	 * webvew Client
	 * 
	 * @author sunkai
	 * 
	 */
	class MyWebViewClient extends WebChromeClient {
		@Override
		public void onProgressChanged(WebView view, int newProgress) {
			// 更新进度条
			DemoWebviewActivity.this.setValue(newProgress);
			super.onProgressChanged(view, newProgress);
		}
	}

	/**
	 * 请求 Charge 的参数类
	 * 
	 * @author sunkai
	 * 
	 */
	class PaymentRequest {
		String channel;
		int amount;

		public PaymentRequest(String channel, int amount) {
			this.channel = channel;
			this.amount = amount;
		}
	}

	/**
	 * 
	 * HTML 和 Native 交互处理的类
	 */
	class JSInterface {
		@JavascriptInterface
		// JS代码调用接口，调用方法：PINGPP_ANDROID_SDK.callPay(channel, amount);
		public void callPay(String channel, int amount) {
			Log.i("js log", channel);
			Log.i("js log", String.valueOf(amount));
			new PaymentTask().execute(new PaymentRequest(channel, amount));

		}
	}
}
