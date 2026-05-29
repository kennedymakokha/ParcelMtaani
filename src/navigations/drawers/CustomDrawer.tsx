/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
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
import { TruncateText } from '../../utils/trancateText';
import { useLogoutMutation } from '../../services/apis/auth.api';
import { useFetchStatusCountQuery } from '../../services/apis/parcel.api';

export default function CustomDrawerContent(props: any) {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state: any) => state.auth);
  const pickupState = useSelector((state: any) => state.pickupEvents.lastEvent);
  const [logoutUser] = useLogoutMutation();
  const { data, refetch } = useFetchPickupsQuery({});

  const userRole: UserRole = user?.role;
  const currentPickup = useSelector(
    (state: any) => state.pickups.currentPickup,
  );
  const isPaid = currentPickup?.paid ?? true;
  const { data: parcelData, refetch: refetchCount } = useFetchStatusCountQuery({
    pickupId: currentPickup?._id,
  });

  const count = parcelData ? parcelData?.data : [];

  const menuItems = getDrawerConfig(pickupState, count, isPaid)[
    userRole as UserRole
  ];

  const pickups = useSelector((state: any) => state.pickups.pickups);

  const dispatch = useDispatch();

  const { socket } = useSocket();

  const switchingRef = useRef(false);

  const handleSwitch = async (point: any) => {
    if (switchingRef.current) return;

    switchingRef.current = true;

    try {
      // CLOSE UI FIRST
      setModalVisible(false);

      props.navigation.closeDrawer();

      // SMALL DELAY
      await new Promise((resolve: any) => setTimeout(resolve, 200));

      // UNSUBSCRIBE OLD
      if (currentPickup?._id) {
        await unsubscribeFromTopic(`pickup_${currentPickup._id}_attendants`);
      }

      // SUBSCRIBE NEW
      await subscribeToTopic(`pickup_${point._id}_attendants`);

      // UPDATE REDUX
      dispatch(setCurrentPickup(point));
    } catch (error) {
      console.log('Pickup switch error:', error);
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
  useEffect(() => {
    if (!socket) return;
    const parcelChange = async (parcel: any) => {
      console.log(parcel);
      await refetch();
      await refetchCount();
    };

    socket.on('Parcel-change', parcelChange);
    return () => {
      socket.off('Parcel-change', parcelChange);
    };
  }, [socket, refetchCount, refetch]);
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
            backgroundColor: colors.card,
            padding: 24,
            alignItems: 'center',
          }}
        >
          <View className="flex items-center justify-center">
            <Icon name="truck-fast" size={74} color={colors.primaryLight} />
          </View>

          <Text
            style={{
              color: colors.secondary,
              fontSize: 18,
              textTransform: 'uppercase',
              fontWeight: '800',
              fontFamily: colors.fontSemiBold,
            }}
          >
            {TruncateText(user?.business?.business_name?.toUpperCase(), 20) ||
              'ParcelMtaani'}
          </Text>

          <Text style={{ color: '#e0e7ff', textAlign: 'center' }}>
            {user?.pickup?.pickup_name?.toUpperCase()}
          </Text>

          <View
            style={{ backgroundColor: colors.card }}
            className="flex items-center justify-center px-4 py-1   rounded-md mt-2"
          >
            <Text style={{ color: colors.secondary }}>
              {userRole?.toUpperCase()}
            </Text>
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
              label={({ color }) => (
                <View style={styles.labelContainer}>
                  <Text style={[styles.labelText, { color }]}>
                    {item.label}
                  </Text>

                  {item.counter && item.counter > 0 && (
                    <View
                      style={{
                        borderRadius: 10,
                        minWidth: 20,
                        height: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 6,
                        backgroundColor: colors.card,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: 12,
                          fontWeight: 'bold',
                        }}
                      >
                        {item.counter}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              icon={({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color} />
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
              onPress={() => props.navigation.navigate('Pickup profile')}
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
            justifyContent: 'flex-end',
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
                setIsLoading(true);
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
                await logoutUser({}).unwrap();
                dispatch(logout());
                setIsLoading(false);
              } catch (error) {
                console.log('Logout error:', error);
              }
            }}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />

            {isLoading ? (
              <ActivityIndicator />
            ) : (
              <Text
                style={{
                  marginLeft: 8,
                  color: colors.danger,
                  fontWeight: '600',
                }}
              >
                Logout
              </Text>
            )}
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
const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  labelText: {
    fontSize: 16,
  },

  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
