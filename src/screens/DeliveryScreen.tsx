import React, { useState } from 'react';
import { View, Text } from 'react-native';
import QRScanner from 'react-native-qr-scanner';   // <-- no curly braces

export default function OnReceivingScreen() {
  const [scannedData, setScannedData] = useState<any>(null);

  return (
    <View style={{ flex: 1 }}>
      {!scannedData ? (
        <QRScanner
  style={{ flex: 1 }}
  onResult={(e) => {
    const parsed = JSON.parse(e.nativeEvent.data)
    setScannedData(parsed)
  }}
/>

        // <QRScanner
        //   style={{ flex: 1 }}
        //   onResult={(e) => {
        //     try {
        //       const parsed = JSON.parse(e.nativeEvent.data);
        //       setScannedData(parsed);
        //     } catch {
        //       setScannedData({ error: 'Invalid QR data' });
        //     }
        //   }}
        // />
      ) : (
        <View>
          <Text>Sender: {scannedData.sender?.name}</Text>
          <Text>Receiver: {scannedData.receiver?.name}</Text>
          <Text>Destination: {scannedData.parcel?.destination}</Text>
          <Text>Price: {scannedData.parcel?.price}</Text>
        </View>
      )}
    </View>
  );
}


// import React, { useState } from "react";
// import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// import { CameraKitCameraScreen } from "react-native-camera-kit";

// export default function OnReceivingScreen() {
//   const [scannedData, setScannedData] = useState<any>(null);
//   const [scanning, setScanning] = useState(true);

//   const handleScan = (event: any) => {
//     const code = event.nativeEvent.codeStringValue;

//     try {
//       const parsed = JSON.parse(code);
//       setScannedData(parsed);
//       setScanning(false);
//     } catch (err: any) {
//       setScannedData({ error: "Invalid QR data",err });
//       setScanning(false);
//     }
//   };

//   if (scanning) {
//     return (
//       <CameraKitCameraScreen
//         scanBarcode={true}
//         onReadCode={handleScan}
//         showFrame={true}
//         laserColor="#2563eb"
//         frameColor="#2563eb"
//       />
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.detailsCard}>
//         {scannedData?.error ? (
//           <Text style={styles.error}>{scannedData.error}</Text>
//         ) : (
//           <>
//             <Text style={styles.sectionTitle}>Sender</Text>
//             <Text>Name: {scannedData.sender?.name}</Text>
//             <Text>Phone: {scannedData.sender?.phone}</Text>

//             <Text style={styles.sectionTitle}>Receiver</Text>
//             <Text>Name: {scannedData.receiver?.name}</Text>
//             <Text>Phone: {scannedData.receiver?.phone}</Text>

//             <Text style={styles.sectionTitle}>Parcel</Text>
//             <Text>Weight: {scannedData.parcel?.weight} kg</Text>
//             <Text>Destination: {scannedData.parcel?.destination}</Text>
//             <Text>Price: KES {scannedData.parcel?.price}</Text>
//             <Text>Receipt No: {scannedData.receiptNo}</Text>
//           </>
//         )}

//         <TouchableOpacity
//           style={styles.button}
//           onPress={() => {
//             setScannedData(null);
//             setScanning(true);
//           }}
//         >
//           <Text style={styles.buttonText}>Scan Another</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.button, { backgroundColor: "#16a34a" }]}
//           onPress={() => {
//             console.log("Confirm reception:", scannedData);
//           }}
//         >
//           <Text style={styles.buttonText}>Confirm Reception</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f9fafb" },
//   title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
//   detailsCard: {
//     flex: 1,
//     backgroundColor: "#fff",
//     margin: 16,
//     padding: 16,
//     borderRadius: 12,
//     elevation: 3,
//   },
//   sectionTitle: { fontSize: 16, fontWeight: "bold", marginTop: 12 },
//   error: { color: "red", fontWeight: "bold" },
//   button: {
//     backgroundColor: "#2563eb",
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 16,
//     alignItems: "center",
//   },
//   buttonText: { color: "#fff", fontWeight: "bold" },
// });
