#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(QRScanner, NSObject)
RCT_EXTERN_METHOD(startScan:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
@end