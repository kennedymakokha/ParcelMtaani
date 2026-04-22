import Foundation
import VisionKit

@objc(QRScanner)
class QRScanner: NSObject {
  
  @objc func startScan(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      // For iOS 16+, DataScannerViewController is the gold standard
      if #available(iOS 16.0, *), DataScannerViewController.isSupported {
        // Implementation of DataScanner goes here
        // For simplicity in this bridge, we'll return a placeholder or 
        // trigger the AVFoundation scanner logic.
      } else {
        reject("UNSUPPORTED", "Device or OS version not supported", nil)
      }
    }
  }
  
  @objc static func requiresMainQueueSetup() -> Bool { return true }
}