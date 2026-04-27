/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/themeContext';
import { UserRole } from '../../../types';
import { drawerConfig } from './config';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useGetPickupsQuery } from '../../services/apis/business.api';
import { setCurrentPickup, setPickups } from '../../features/pickSlice';
export default function CustomDrawerContent(props: any) {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const { user } = useSelector((state: any) => state.auth);
  // Example: role fetched from context or props
  const { data } = useGetPickupsQuery({});
  const userRole: UserRole = user?.role; // replace with dynamic value
  const pickups = useSelector((state: any) => state.pickups.pickups);
  const dispatch = useDispatch();
  const menuItems = drawerConfig[userRole];
  const currentPickup = useSelector(
    (state: any) => state.pickups.currentPickup,
  );
  const handleSwitch = (point: any) => {
    dispatch(setCurrentPickup(point));
    setModalVisible(false);
  };

  useEffect(() => {
    dispatch(setPickups(data || {}));
  }, [data, dispatch]);

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1, backgroundColor: colors.background }}
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.primary,
          padding: 24,
          alignItems: 'center',
        }}
      >
        <View className="flex items-center justify-center">
          <Icon name="truck-fast" size={74} color="#fff" />
        </View>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
          ParcelMtaani
        </Text>
        <Text style={{ color: '#e0e7ff' }}>
          {user?.pickup?.pickup_name?.toUpperCase()}
        </Text>
        <View className="flex items-center justify-center px-4 py-1 border border-blue-500 rounded-md mt-2">
          <Text style={{ color: '#e0e7ff' }}>{userRole.toUpperCase()}</Text>
        </View>

        <Text style={{ color: '#e0e7ff' }}>{user.name}</Text>

        {/* Super Admin Pickup Point Switcher */}
        {userRole === 'superadmin' && (
          <TouchableOpacity
            style={{
              marginTop: 12,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#1e40af',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
            }}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="location-outline" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 6 }}>
              {currentPickup?.pickup_name || 'Select Pickup'}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color="#fff"
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Role‑based Drawer Items */}
      <View
        style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}
      >
        {menuItems?.map(item => (
          <DrawerItem
            key={item.label}
            label={item.label}
            icon={({ color, size }) => (
              <Ionicons name={item.icon} size={size} color={color} />
            )}
            onPress={() => props.navigation.navigate(item.screen)}
          />
        ))}
      </View>

      {/* Footer */}
      <View
        className="flex flex-row items-center justify-between"
        style={{
          padding: 16,
          borderTopWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.background,
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Ionicons
            name="settings-outline"
            size={20}
            color={colors.secondary}
          />
          <Text
            style={{ marginLeft: 8, color: colors.text, fontWeight: '600' }}
          >
            Settings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text
            style={{ marginLeft: 8, color: colors.danger, fontWeight: '600' }}
          >
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pickup Point Modal for Super Admin */}
      {userRole === 'superadmin' && (
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                backgroundColor: colors.background,
                borderRadius: 12,
                width: 300,
                padding: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: colors.text,
                  marginBottom: 12,
                }}
              >
                Switch Pickup Point
              </Text>
              <FlatList
                data={pickups}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderColor: colors.border,
                    }}
                    onPress={() => handleSwitch(item)}
                  >
                    <Text style={{ color: colors.text }}>
                      {item.pickup_name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  padding: 12,
                  borderRadius: 8,
                  marginTop: 16,
                }}
                onPress={() => setModalVisible(false)}
              >
                <Text
                  style={{
                    color: '#fff',
                    textAlign: 'center',
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </DrawerContentScrollView>
  );
}
