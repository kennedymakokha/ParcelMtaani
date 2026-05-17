import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useTheme } from '../contexts/themeContext';

const { width } = Dimensions.get('window');

export default function ParcelSplash({ navigation }) {
  const { colors } = useTheme();

  // --- ANIMATION VALUES ---
  const senderId = useRef(new Animated.Value(0)).current;
  const parcelId = useRef(new Animated.Value(0)).current;
  const truckId = useRef(new Animated.Value(0)).current;
  const parcelLoadId = useRef(new Animated.Value(0)).current;
  const receiverId = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(senderId, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(parcelId, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.timing(truckId, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(parcelLoadId, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(truckId, { toValue: 2, duration: 1200, useNativeDriver: true }),
        Animated.timing(senderId, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(receiverId, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(parcelLoadId, { toValue: 2, duration: 600, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        // navigation.replace('Login');
      }, 1500);
    });
  }, []);

  // --- INTERPOLATIONS ---
  const senderTranslateX = senderId.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] });
  const truckTranslateX = truckId.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [-100, width * 0.35, width * 0.55],
  });
  const receiverTranslateX = receiverId.interpolate({ inputRange: [0, 1], outputRange: [60, 0] });
  const parcelTranslateX = parcelLoadId.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [width * 0.18, width * 0.4, width * 0.72],
  });
  const parcelTranslateY = parcelLoadId.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 50, 0],
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
      {/* Header Branding */}
      <View style={{ position: 'absolute', top: 60, alignItems: 'center' }}>
        <Text style={{ fontSize: 12, letterSpacing: 2, color: colors.subText, fontWeight: '600', textTransform: 'uppercase' }}>
          Logistics Network
        </Text>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 4 }}>
          Seamless Package Delivery
        </Text>
        <Icon name="truck-fast" size={74} color={colors.primary} style={{ marginVertical: 8 }} />
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.secondary }}>Parcel Mtaani</Text>
        <Text style={{ fontSize: 14, color: colors.subText, marginTop: 6 }}>Secure Parcel Management</Text>
      </View>

      {/* Scene Track */}
      <View style={styles.sceneContainer}>
        {/* Sender */}
        <Animated.View
          style={[
            styles.actor,
            { left: width * 0.08, opacity: senderId, transform: [{ translateX: senderTranslateX }] },
          ]}
        >
          <Ionicons name="person-circle" size={56} color={colors.success} />
          <Text style={{ marginTop: 4, fontSize: 12, fontWeight: '600', color: colors.success }}>Sender</Text>
          <Text style={{ fontSize: 10, color: colors.subText }}>Step 1: Booked</Text>
        </Animated.View>

        {/* Truck */}
        <Animated.View style={[styles.actor, { transform: [{ translateX: truckTranslateX }] }]}>
          <Ionicons name="bus" size={48} color={colors.primary} />
          <Text style={{ marginTop: 4, fontSize: 12, fontWeight: '600', color: colors.primary }}>Transit</Text>
        </Animated.View>

        {/* Receiver */}
        <Animated.View
          style={[
            styles.actor,
            { right: width * 0.08, opacity: receiverId, transform: [{ translateX: receiverTranslateX }] },
          ]}
        >
          <Ionicons name="person-circle-outline" size={56} color={colors.error} />
          <Text style={{ marginTop: 4, fontSize: 12, fontWeight: '600', color: colors.error }}>Receiver</Text>
          <Text style={{ fontSize: 10, color: colors.subText }}>Step 2: Collect</Text>
        </Animated.View>

        {/* Parcel */}
        <Animated.View
          style={[
            styles.parcel,
            {
              opacity: parcelId,
              transform: [
                { scale: parcelId },
                { translateX: parcelTranslateX },
                { translateY: parcelTranslateY },
              ],
            },
          ]}
        >
          <Ionicons name="cube" size={28} color={colors.warning} />
        </Animated.View>
      </View>

      {/* Ground Line */}
      <View style={{ width: '80%', height: 2, backgroundColor: colors.border, marginTop: 16, borderRadius: 999 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  sceneContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    justifyContent: 'center',
  },
  actor: {
    position: 'absolute',
    alignItems: 'center',
    bottom: 20,
  },
  parcel: {
    position: 'absolute',
    top: 50,
    zIndex: 10,
  },
});
