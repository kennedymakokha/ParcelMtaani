/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { Modal, View, Text } from 'react-native';
import { useTheme } from '../../contexts/themeContext';
import { PrimaryButton } from '../PrimaryButton';
import { SecondaryButton } from '../SecondaryButton';


interface ConfirmModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  visible,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  onConfirm,
  onCancel,
  loading = false,
  confirmText = 'Yes, Delete',
  cancelText = 'Cancel',
}: ConfirmModalProps) {
  const { colors } = useTheme();

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.text,
              marginBottom: 10,
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              color: colors.secondary,
              marginBottom: 20,
            }}
          >
            {message}
          </Text>

          <PrimaryButton
            title={confirmText}
            onPress={onConfirm}
            loading={loading}
          />

          <SecondaryButton title={cancelText} onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
}