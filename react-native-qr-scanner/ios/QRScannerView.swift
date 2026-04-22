import AVFoundation
import UIKit

class QRScannerView: UIView, AVCaptureMetadataOutputObjectsDelegate {
    var captureSession: AVCaptureSession?
    var onResult: ((String) -> Void)?

    override init(frame: CGRect) {
        super.init(frame: frame)
        setupCamera()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupCamera()
    }

    func setupCamera() {
        captureSession = AVCaptureSession()
        guard let videoCaptureDevice = AVCaptureDevice.default(for: .video) else { return }
        let videoInput = try? AVCaptureDeviceInput(device: videoCaptureDevice)
        if (captureSession?.canAddInput(videoInput!) ?? false) {
            captureSession?.addInput(videoInput!)
        }

        let metadataOutput = AVCaptureMetadataOutput()
        if (captureSession?.canAddOutput(metadataOutput) ?? false) {
            captureSession?.addOutput(metadataOutput)
            metadataOutput.setMetadataObjectsDelegate(self, queue: DispatchQueue.main)
            metadataOutput.metadataObjectTypes = [.qr]
        }
    }

    func metadataOutput(_ output: AVCaptureMetadataOutput,
                        didOutput metadataObjects: [AVMetadataObject],
                        from connection: AVCaptureConnection) {
        if let obj = metadataObjects.first as? AVMetadataMachineReadableCodeObject {
            if let str = obj.stringValue {
                onResult?(str)
            }
        }
    }
}
