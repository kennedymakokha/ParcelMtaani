package com.qrscanner

import com.facebook.react.bridge.Arguments
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter

class QRScannerViewManager : SimpleViewManager<QRScannerView>() {
    override fun getName(): String = "QRScannerView"

    override fun createViewInstance(reactContext: ThemedReactContext): QRScannerView {
        val view = QRScannerView(reactContext, null)
        val lifecycleOwner = reactContext.currentActivity as? androidx.lifecycle.LifecycleOwner
        lifecycleOwner?.let {
            view.startCamera(it) { result ->
                val event = Arguments.createMap()
                event.putString("data", result)
                reactContext
                    .getJSModule(RCTEventEmitter::class.java)
                    .receiveEvent(view.id, "onResult", event)
            }
        }
        return view
    }
}
