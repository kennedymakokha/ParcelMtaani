import {
  View,
  Text,
  Modal,
} from 'react-native';
import Signature from 'react-native-signature-canvas';
import { FormInput } from '../components/input.component';
import { PrimaryButton } from '../components/PrimaryButton';


export const ParcelCollectionModal = ({
  modalVisible,
  selectedParcel,
  formData,
  setFormData,
  signatureRef,
  setSignatureData,
  colors,
  handleConfirmPickup,
  collectionLoading,
  setMsg,
 
}: any) => {

  return (
    <Modal visible={modalVisible} animationType="slide">
      <View
        style={{ flex: 1, padding: 20, backgroundColor: colors.background }}
      >
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
          Confirm Pickup
        </Text>
        <Text style={{ marginTop: 10, color: colors.secondary }}>
          Parcel: {selectedParcel?.code}
        </Text>

        {/* Signature Pad */}
        <View style={{ flex: 1, marginVertical: 20 }}>
          <FormInput
            keyboardType="numeric"
            label="National ID"
            value={formData.reciever_ID}
            onChangeText={t =>
              setFormData((prev:any) => ({ ...prev, reciever_ID: t }))
            }
          />
          <Signature
            ref={signatureRef}
            onOK={sig => {
              setSignatureData(sig);
            }}
            onEmpty={() =>
              setMsg({ msg: 'No signature captured', state: 'error' })
            }
            descriptionText="Sign to confirm pickup"
            webStyle={`
      .m-signature-pad--footer { display: none; }
      .m-signature-pad { border: 1px solid ${colors.border}; }
      .m-signature-pad--body { background: ${colors.card}; }
    `}
          />
        </View>

        <PrimaryButton
          onPress={async () => {
            await signatureRef.current?.readSignature(); // 🔥 THIS is the key
            await handleConfirmPickup();
          }}
          loading={collectionLoading}
          title="Confirm Pickup"
        />
      </View>
    </Modal>
  );
};
