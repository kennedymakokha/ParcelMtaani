package com.parcelmtaani

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.google.mlkit.vision.codescanner.GmsBarcodeScanning

class QRScannerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "QRScanner"

    @ReactMethod
    fun startScan(promise: Promise) {
        val scanner = GmsBarcodeScanning.getClient(reactApplicationContext)
        scanner.startScan()
            .addOnSuccessListener { barcode ->
                promise.resolve(barcode.rawValue)
            }
            .addOnFailureListener { e ->
                promise.reject("SCAN_ERROR", e.message)
            }
    }
}