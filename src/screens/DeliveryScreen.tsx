import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import QRCodeScanner from "react-native-qrcode-scanner";
import { RNCamera } from "react-native-camera";

export default function OnReceivingScreen() {
  const [scannedData, setScannedData] = useState<any>(null);

  const handleScan = (e: any) => {
    try {
      const parsed = JSON.parse(e.data); // QR payload is JSON from buildQrPayload
      setScannedData(parsed);
    } catch (err) {
      setScannedData({ error: "Invalid QR data" });
    }
  };

  return (
    <View style={styles.container}>
      {!scannedData ? (
        <QRCodeScanner
          onRead={handleScan}
          flashMode={RNCamera.Constants.FlashMode.off}
          topContent={
            <Text style={styles.title}>Scan Parcel QR Code</Text>
          }
        />
      ) : (
        <View style={styles.detailsCard}>
          {scannedData.error ? (
            <Text style={styles.error}>{scannedData.error}</Text>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Sender</Text>
              <Text>Name: {scannedData.sender?.name}</Text>
              <Text>Phone: {scannedData.sender?.phone}</Text>
              <Text>Address: {scannedData.sender?.address}</Text>

              <Text style={styles.sectionTitle}>Receiver</Text>
              <Text>Name: {scannedData.receiver?.name}</Text>
              <Text>Phone: {scannedData.receiver?.phone}</Text>
              <Text>Address: {scannedData.receiver?.address}</Text>

              <Text style={styles.sectionTitle}>Parcel</Text>
              <Text>Weight: {scannedData.parcel?.weight} kg</Text>
              <Text>Destination: {scannedData.parcel?.destination}</Text>
              <Text>Price: KES {scannedData.parcel?.price}</Text>
              <Text>Receipt No: {scannedData.receiptNo}</Text>
            </>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={() => setScannedData(null)}
          >
            <Text style={styles.buttonText}>Scan Another</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#16a34a" }]}
            onPress={() => {
              // TODO: Call backend API to mark parcel as "Received"
              console.log("Confirm reception:", scannedData);
            }}
          >
            <Text style={styles.buttonText}>Confirm Reception</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  detailsCard: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginTop: 12 },
  error: { color: "red", fontWeight: "bold" },
  button: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
