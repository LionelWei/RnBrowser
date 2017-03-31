//
//  CaptureView.m
//  RnBrowser
//
//  Created by AZoo on 06/01/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import "CaptureView.h"
#import <React/UIView+React.h>
#import <React/RCTUIManager.h>
#import <React/RCTBridge.h>
#import <React/RCTEventDispatcher.h>

@implementation CaptureView
RCT_EXPORT_MODULE()

@synthesize bridge = _bridge;

- (dispatch_queue_t)methodQueue
{
  return self.bridge.uiManager.methodQueue;
}

RCT_CUSTOM_VIEW_PROPERTY(tagWithRect, NSNumber, UIImageView)
{
  NSLog(@"tag =====> %@",json);
  NSNumber *target = [RCTConvert NSNumber:json[@"tag"]];
  NSLog(@"tag =====> %@,%@",json,target);
  int view_h = [RCTConvert NSNumber:json[@"h"]].intValue;
  int view_w = [RCTConvert NSNumber:json[@"w"]].intValue;
  int view_x = [RCTConvert NSNumber:json[@"x"]].intValue;
  int view_y = [RCTConvert NSNumber:json[@"y"]].intValue;
  
  dispatch_async([self methodQueue], ^{
    [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
      dispatch_async(dispatch_get_main_queue(), ^{
        UIView *targetView;
        targetView = viewRegistry[target];
        NSLog(@"target ====> %@",targetView);
        
        if (!targetView) {
          return;
        }
//        CGSize size = CGSizeMake([UIScreen mainScreen].bounds, view_h);//CGSizeMake(view_w, view_h);
//        CGPoint point = CGPointMake(view_x, view_y);
        
        UIGraphicsBeginImageContextWithOptions([UIScreen mainScreen].bounds.size, NO, [UIScreen mainScreen].scale);
//        [UIImage imageWithCGImage:CGImageCreateWithImageInRect([image CGImage], rect)];
        BOOL success = [targetView drawViewHierarchyInRect:(CGRect){CGPointZero, [UIScreen mainScreen].bounds.size} afterScreenUpdates:YES];
        UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
        
        if (!success || !image) {
          return;
        }
        view.image = [UIImage imageWithCGImage:CGImageCreateWithImageInRect([image CGImage], (CGRect){CGPointMake(view_x, view_y*[UIScreen mainScreen].scale),CGSizeMake(view_w*[UIScreen mainScreen].scale, view_h*[UIScreen mainScreen].scale)})];
      });
    }];
  });
  
}

- (UIView *)view
{
  UIImageView *view = [[UIImageView alloc]init];
  view.contentMode = UIViewContentModeScaleAspectFill;
  return view;
}


@end
