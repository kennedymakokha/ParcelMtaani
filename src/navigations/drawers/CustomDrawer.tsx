/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/themeContext';
import { UserRole } from '../../../types';
import { getDrawerConfig } from './config';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useFetchPickupsQuery } from '../../services/apis/business.api';
import {
  addPickup,
  setCurrentPickup,
  setPickups,
} from '../../features/pickSlice';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '../../features/auth/authSlice';
import { useSocket } from '../../contexts/socketContext';
import { unsubscribeAllTopics } from '../../utils/topicSubsriptiptions';
import {
  subscribeToTopic,
  unsubscribeFromTopic,
} from '../../utils/subscribeUnsubscribe';
import { DrawerActions } from '@react-navigation/native';

export default function CustomDrawerContent(props: any) {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const { user } = useSelector((state: any) => state.auth);
  const pickupState = useSelector((state: any) => state.pickupEvents.lastEvent);

  const { data, refetch } = useFetchPickupsQuery({});

  const userRole: UserRole = user?.role;

  const menuItems = getDrawerConfig(pickupState)[userRole];

  const pickups = useSelector((state: any) => state.pickups.pickups);

  const dispatch = useDispatch();

  const { socket } = useSocket();

  const switchingRef = useRef(false);

  const currentPickup = useSelector(
    (state: any) => state.pickups.currentPickup,
  );

  const handleSwitch = async (point: any) => {
    if (switchingRef.current) return;

    switchingRef.current = true;

    try {
      await unsubscribeFromTopic(`pickup_${currentPickup?._id}_attendants`);

      await subscribeToTopic(`pickup_${point._id}_attendants`);

      dispatch(setCurrentPickup(point));

      setModalVisible(false);
      props.navigation.dispatch(DrawerActions.closeDrawer());
    } finally {
      switchingRef.current = false;
    }
  };

  useEffect(() => {
    dispatch(setPickups(data || {}));
  }, [data, dispatch]);

  useEffect(() => {
    if (!socket) return;

    const onPickupCreated = async (newPickup: any) => {
      dispatch(addPickup(newPickup));
      await refetch();
    };

    const onSuccessfullDelivery = async (newPickup: any) => {
      dispatch(addPickup(newPickup));
      await refetch();
    };

    socket.on('pickup_created', onPickupCreated);

    socket.on('Successful Delivery', onSuccessfullDelivery);

    return () => {
      socket.off('pickup_created', onPickupCreated);

      socket.off('Successful Delivery', onSuccessfullDelivery);
    };
  }, [socket, dispatch, refetch]);

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: colors.background,
        justifyContent: 'space-between',
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* TOP CONTENT */}
      <View>
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

          <Text
            style={{
              color: '#fff',
              fontSize: 18,
              textTransform: 'uppercase',
              fontWeight: '800',
              fontFamily: colors.fontSemiBold,
            }}
          >
            Parcel Mtaani
          </Text>

          <Text style={{ color: '#e0e7ff', textAlign: 'center' }}>
            {user?.pickup?.pickup_name?.toUpperCase()}
          </Text>

          <View className="flex items-center justify-center px-4 py-1 border border-blue-500 rounded-md mt-2">
            <Text style={{ color: '#e0e7ff' }}>{userRole?.toUpperCase()}</Text>
          </View>

          <Text
            style={{
              color: '#e0e7ff',
              marginTop: 4,
              textAlign: 'center',
            }}
          >
            {user?.name}
          </Text>

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
                maxWidth: '100%',
              }}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="location-outline" size={18} color="#fff" />

              <Text
                numberOfLines={1}
                style={{
                  color: '#fff',
                  fontWeight: '600',
                  marginLeft: 6,
                  maxWidth: 180,
                }}
              >
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

        {/* Drawer Items */}
        <View
          style={{
            flexGrow: 1,
            backgroundColor: colors.background,
            padding: 16,
          }}
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

          <View
            style={{
              height: 1,
              width: '100%',
              backgroundColor: '#fecaca',
              marginVertical: 10,
            }}
          />
          {user.role === 'superadmin' && (
            <DrawerItem
              label="Business Profile"
              icon={({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color} />
              )}
              onPress={() => props.navigation.navigate('Business profile')}
            />
          )}
          {user.role === 'admin' && (
            <DrawerItem
              label="Pickup Profile"
              icon={({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color} />
              )}
              onPress={() => props.navigation.navigate('Profile')}
            />
          )}
          <DrawerItem
            label="User Profile"
            icon={({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            )}
            onPress={() => props.navigation.navigate('Profile')}
          />
        </View>
      </View>

      {/* Footer */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 24,
          borderTopWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.background,
        }}
      >
        <View
          style={{
            gap: 14,
            flexDirection: 'row',
            justifyContent:'flex-end',
          }}
        >
          {/* SETTINGS */}
          {/* <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color={colors.secondary}
            />

            <Text
              style={{
                marginLeft: 8,
                color: colors.text,
                fontWeight: '600',
              }}
            >
              Settings
            </Text>
          </TouchableOpacity> */}

          {/* LOGOUT */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={async () => {
              try {
                /**
                 * UNSUBSCRIBE FROM ALL USER TOPICS
                 */
                await unsubscribeAllTopics(user);

                /**
                 * EXTRA SAFETY UNSUBSCRIBE
                 */

                if (currentPickup?._id) {
                  await unsubscribeFromTopic(
                    `pickup_${currentPickup._id}_attendants`,
                  );
                }

                if (user?.business?._id) {
                  await unsubscribeFromTopic(
                    `business_${user.business._id}_crew`,
                  );

                  await unsubscribeFromTopic(
                    `business_${user.business._id}_admin`,
                  );
                }

                /**
                 * GLOBAL TOPICS
                 */
                await unsubscribeFromTopic('parcel-updates');

                /**
                 * SOCKET CLEANUP
                 */
                if (socket?.disconnect) {
                  socket.disconnect();
                }

                /**
                 * CLEAR STORAGE
                 */
                await AsyncStorage.multiRemove([
                  'accessToken',
                  'userId',
                  'tokenExpiry',
                ]);

                /**
                 * CLEAR REDUX
                 */
                dispatch(setCurrentPickup(null));

                dispatch(logout());
              } catch (error) {
                console.log('Logout error:', error);
              }
            }}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />

            <Text
              style={{
                marginLeft: 8,
                color: colors.danger,
                fontWeight: '600',
              }}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pickup Point Modal */}
      {userRole === 'superadmin' && (
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 16,
            }}
          >
            <View
              style={{
                backgroundColor: colors.background,
                borderRadius: 12,
                width: '90%',
                maxWidth: 400,
                maxHeight: '70%',
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
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 350 }}
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
