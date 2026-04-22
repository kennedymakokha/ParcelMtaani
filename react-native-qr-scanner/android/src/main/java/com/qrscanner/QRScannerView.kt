package com.qrscanner

import android.content.Context
import android.util.AttributeSet
import android.view.View
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.lifecycle.LifecycleOwner
import com.google.zxing.BinaryBitmap
import com.google.zxing.MultiFormatReader
import com.google.zxing.Result
import com.google.zxing.common.HybridBinarizer
import com.google.zxing.PlanarYUVLuminanceSource
import java.util.concurrent.Executors

class QRScannerView(context: Context, attrs: AttributeSet?) : View(context, attrs) {
    private val reader = MultiFormatReader()
    private val executor = Executors.newSingleThreadExecutor()

    fun startCamera(owner: LifecycleOwner, onResult: (String) -> Unit) {
        val providerFuture = ProcessCameraProvider.getInstance(context)
        providerFuture.addListener({
            val provider = providerFuture.get()

            val analysis = ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()

            analysis.setAnalyzer(executor, ImageAnalysis.Analyzer { image: ImageProxy ->
                val result = decodeImage(image)
                result?.let { onResult(it) }
                image.close()
            })

            provider.unbindAll()
            provider.bindToLifecycle(owner, CameraSelector.DEFAULT_BACK_CAMERA, analysis)
        }, context.mainExecutor)
    }

    private fun decodeImage(image: ImageProxy): String? {
        val buffer = image.planes[0].buffer
        val bytes = ByteArray(buffer.remaining())
        buffer.get(bytes)

        val width: Int = image.width
        val height: Int = image.height

        val source = PlanarYUVLuminanceSource(
            bytes, width, height, 0, 0, width, height, false
        )

        val bitmap = BinaryBitmap(HybridBinarizer(source))

        return try {
            val result: Result = reader.decode(bitmap)
            result.text
        } catch (e: Exception) {
            null
        }
    }
}
