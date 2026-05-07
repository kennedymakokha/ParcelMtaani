/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View, Text, FlatList, Modal, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/themeContext';
import { useDispatch, useSelector } from 'react-redux';
import { markAsRead } from '../features/notificationsSlice';
import { SecondaryButton } from '../components/SecondaryButton';

export default function NotificationPage() {
  const { colors } = useTheme();
  const notifications = useSelector((state: any) => state.notifications.list);
  const dispatch = useDispatch();

  const [selected, setSelected] = useState<any>(null);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: '700',
          color: colors.primary,
          marginBottom: 12,
        }}
      >
        Notifications
      </Text>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setSelected(item);
              dispatch(markAsRead(item.id));
            }}
            style={{
              backgroundColor: item.read ? colors.card : colors.primary + '22',
              borderRadius: 8,
              padding: 12,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontWeight: '600', color: colors.text }}>
              {item.title}
            </Text>
            <Text style={{ color: colors.secondary }}>{item.body}</Text>
            <Text style={{ fontSize: 12, color: colors.secondary }}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Detail Modal */}
      <Modal visible={!!selected} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.overlay,
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 12,
              }}
            >
              {selected?.title}
            </Text>
            <Text style={{ color: colors.secondary, marginBottom: 20 }}>
              {selected?.body}
            </Text>
            <SecondaryButton title="Close" onPress={() => setSelected(null)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
