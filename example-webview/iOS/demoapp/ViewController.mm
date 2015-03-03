//
//  ViewController.m
//  ViewController
//
//  Created by Jacky Hu on 07/14/14.
//

#include <sys/socket.h> // Per msqr
#include <sys/sysctl.h>
#include <net/if.h>
#include <net/if_dl.h>
#import "ViewController.h"
#import "AppDelegate.h"

#define kWaiting          @"正在获取支付凭据,请稍后..."
#define kNote             @"提示"
#define kConfirm          @"确定"
#define kErrorNet         @"网络错误"
#define kResult           @"支付结果：%@"

#define kUrlScheme  @"YOUR-URL-SHCEME"
#define kUrl        @"YOUR-CHARGE-URL"
#define kWebUrl     @"YOUR-WEBVIEW-URL"

@interface ViewController ()

@end

@implementation ViewController
@synthesize channel;

- (void)dealloc
{
    self.channel = nil;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    UIWebView *webView = [[UIWebView alloc] initWithFrame:CGRectMake(0, 0, 320, 568)];
    [webView setDelegate:self];
    [self.view addSubview:webView];
    
    NSString *urlString = kWebUrl;
    NSURL *nsurl = [NSURL URLWithString:urlString];
    NSURLRequest *nsrequest = [NSURLRequest requestWithURL:nsurl];
    [webView loadRequest:nsrequest];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}


- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType
{
    NSString *requestString = [[request URL] absoluteString];
    NSString *scheme = @"js-pingpp";
    NSString *protocol = [NSString stringWithFormat:@"%@://", scheme];
    if ([requestString hasPrefix:protocol]) {
        NSString *str = [requestString substringFromIndex:[protocol length]];
        NSString *host = [str substringToIndex:[str rangeOfString:@"?"].location];
        NSString *paramString = [str substringFromIndex:[str rangeOfString:@"?"].location+1];
        NSMutableDictionary *queryStringDict = [[NSMutableDictionary alloc] init];
        NSArray *urlComponents = [paramString componentsSeparatedByString:@"&"];
        for (NSString *keyValuePair in urlComponents) {
            NSArray *pairComponents = [keyValuePair componentsSeparatedByString:@"="];
            NSString *key = [pairComponents objectAtIndex:0];
            NSString *value = [pairComponents objectAtIndex:1];
            [queryStringDict setObject:value forKey:key];
        }
        if ([host isEqualToString:@"pay"]) {
            [self payWithChannel:[queryStringDict objectForKey:@"channel"] amount:[queryStringDict objectForKey:@"amount"]];
        }
        return NO;
    }
    return YES;
}

- (void)webViewDidStartLoad:(UIWebView *)webView
{
}

- (void)webViewDidFinishLoad:(UIWebView *)webView
{
    // 页面 js 调用方法：PINGPP_IOS_SDK.callPay(channel, amount)
    NSString *js = @"(function() {\
        window.PINGPP_IOS_SDK = {};\
        window.PINGPP_IOS_SDK.callPay = function(channel, amount) {\
            location.href = \"js-pingpp://pay?channel=\" + channel + \"&amount=\" + amount;\
        };\
        return true;\
    })();";
    [webView stringByEvaluatingJavaScriptFromString:js];
}

- (void)webView:(UIWebView *)webView didFailLoadWithError:(NSError *)error
{
}

- (void)showAlertWait
{
    mAlert = [[UIAlertView alloc] initWithTitle:kWaiting message:nil delegate:self cancelButtonTitle:nil otherButtonTitles: nil];
    [mAlert show];
    UIActivityIndicatorView* aiv = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleWhite];
    aiv.center = CGPointMake(mAlert.frame.size.width / 2.0f - 15, mAlert.frame.size.height / 2.0f + 10 );
    [aiv startAnimating];
    [mAlert addSubview:aiv];
}

- (void)showAlertMessage:(NSString*)msg
{
    mAlert = [[UIAlertView alloc] initWithTitle:kNote message:msg delegate:nil cancelButtonTitle:kConfirm otherButtonTitles:nil, nil];
    [mAlert show];
}

- (void)hideAlert
{
    if (mAlert != nil)
    {
        [mAlert dismissWithClickedButtonIndex:0 animated:YES];
        mAlert = nil;
    }
}

- (void)payWithChannel:(NSString *)ch amount:(NSString *)amount
{
    if (![ch isEqualToString:@"wx"]
        && ![ch isEqualToString:@"alipay"]
        && ![ch isEqualToString:@"upmp"]) {
        return;
    }
    self.channel = ch;
    
    long long amountl = [[amount stringByReplacingOccurrencesOfString:@"." withString:@""] longLongValue];
    if (amountl == 0) {
        return;
    }
    NSString *amountStr = [NSString stringWithFormat:@"%lld", amountl];
    NSURL* url = [NSURL URLWithString:kUrl];
    NSMutableURLRequest * postRequest=[NSMutableURLRequest requestWithURL:url];

    NSDictionary* dict = @{
        @"channel" : self.channel,
        @"amount"  : amountStr
    };
    NSError* error;
    NSData* data = [NSJSONSerialization dataWithJSONObject:dict options:NSJSONWritingPrettyPrinted error:&error];
    NSString *bodyData = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];

    [postRequest setHTTPBody:[NSData dataWithBytes:[bodyData UTF8String] length:strlen([bodyData UTF8String])]];
    [postRequest setHTTPMethod:@"POST"];
    [postRequest setValue:@"application/json; charset=utf-8" forHTTPHeaderField:@"Content-Type"];

    NSURLConnection* urlConn = [[NSURLConnection alloc] initWithRequest:postRequest delegate:self];
    [urlConn start];
    [self showAlertWait];
}

- (void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse*)response
{
    NSHTTPURLResponse* rsp = (NSHTTPURLResponse*)response;
    long code = [rsp statusCode];
    if (code != 200)
    {
        [self hideAlert];
        [self showAlertMessage:kErrorNet];
        [connection cancel];
        connection = nil;
    }
    else
    {
        if (mData != nil)
        {
            mData = nil;
        }
        mData = [[NSMutableData alloc] init];
    }
}

- (void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data
{
    [mData appendData:data];
}

- (void)connectionDidFinishLoading:(NSURLConnection *)connection
{
    [self hideAlert];
    NSString* data = [[NSMutableString alloc] initWithData:mData encoding:NSUTF8StringEncoding];
    if (data != nil && data.length > 0) {
        ViewController * __weak weakSelf = self;
        dispatch_async(dispatch_get_main_queue(), ^{
            [Pingpp createPayment:data viewController:weakSelf appURLScheme:kUrlScheme withCompletion:^(NSString *result, PingppError *error) {
                NSLog(@"completion block: %@", result);
                if (error == nil) {
                    NSLog(@"PingppError is nil");
                } else {
                    NSLog(@"PingppError: code=%lu msg=%@", (unsigned  long)error.code, [error getMsg]);
                }
                [weakSelf showAlertMessage:result];
            }];
        });
        
        
    }
    connection = nil;

}

-(void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error
{
    [self hideAlert];
    [self showAlertMessage:kErrorNet];
    connection = nil;
}

@end
