/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View, Text, FlatList, Modal, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/themeContext';
import { useDispatch, useSelector } from 'react-redux';
import { markAsRead } from '../features/notificationsSlice';
import { SecondaryButton } from '../components/SecondaryButton';
import { TruncateText } from '../utils/trancateText';

export default function NotificationPage() {
  const { colors } = useTheme();
  const notifications = useSelector((state: any) => state.notifications.list);
  const dispatch = useDispatch();

  const [selected, setSelected] = useState<any>(null);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
     
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
            <Text style={{ fontWeight: '600', color: colors.subText }}>
              {item.title}
            </Text>
            <Text style={{ color: colors.text }}>
              {TruncateText(item.body, 27)}
            </Text>
            <Text
              style={{
                justifyContent: 'flex-end',
                textAlign: 'right',
                fontSize: 12,
                color: colors.subText,
              }}
            >
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
            <Text style={{ color: colors.subText, marginBottom: 20 }}>
              {selected?.body}
            </Text>
            <SecondaryButton title="Close" onPress={() => setSelected(null)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
