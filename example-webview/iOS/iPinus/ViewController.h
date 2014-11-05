//
//  ViewController.h
//  ViewController
//
//  Created by Jacky Hu on 07/14/14.
//

#import <UIKit/UIKit.h>

@interface ViewController : UIViewController<UIAlertViewDelegate, UIWebViewDelegate>
{
    UIAlertView* mAlert;
    NSMutableData* mData;
}

@property(nonatomic, retain)NSString *channel;

- (void)payWithChannel:(NSString *)ch amount:(NSString *)amount;
- (void)showAlertWait;
- (void)showAlertMessage:(NSString*)msg;
- (void)hideAlert;

@end
