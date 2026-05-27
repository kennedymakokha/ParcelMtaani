/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/themeContext';
import Icon from 'react-native-vector-icons/FontAwesome6';

const { width } = Dimensions.get('window');

export default function SplashScreen({ navigation }: any) {
  const { colors } = useTheme();
 
  const animationProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 5200ms is perfectly deliberate, giving it a majestic movie-reveal pace
    Animated.timing(animationProgress, {
      toValue: 1,
      duration: 5200,
      useNativeDriver: false, 
    }).start(() => {
      setTimeout(() => {
        navigation.replace('Login');
      }, 1000);
    });
  }, [animationProgress, navigation]);

  // --- INTERPOLATIONS ---

  // CLEAN VIEWPORT TRANSIT TRACKING
  // 0.0 -> 0.55: Drives from offscreen left to offscreen right
  // 0.55 -> 0.60: Teleports instantly to offscreen left while invisible
  // 0.60 -> 1.0: Fades in and parks perfectly over the text
  const truckTranslateX = animationProgress.interpolate({
    inputRange: [0, 0.55, 0.60, 1],
    outputRange: [-80, width + 80, -80, width / 2 - 32], 
  });

  // Hides the truck during its teleportation phase so it doesn't cross backwards
  const truckOpacity = animationProgress.interpolate({
    inputRange: [0, 0.53, 0.55, 0.62, 0.68, 1],
    outputRange: [1, 1, 0, 0, 1, 1],
  });

  // Soft vibration physics to mimic rubber tyres hitting tarmac
  const truckRotate = animationProgress.interpolate({
    inputRange: [0, 0.15, 0.35, 0.55, 0.65, 0.85, 1],
    outputRange: ['0deg', '3deg', '-1deg', '0deg', '4deg', '-2deg', '0deg'],
  });

  // The text container mask widens exactly as the truck sweeps over it
  const textMaskWidth = animationProgress.interpolate({
    inputRange: [0, 0.50, 1],
    outputRange: [0, width * 0.85, width * 0.85],
  });

  // Tagline and Ground axis fade up organically as the truck parks safely home
  const elementsOpacity = animationProgress.interpolate({
    inputRange: [0, 0.70, 0.95],
    outputRange: [0, 0, 1],
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Brand Animation Sandbox Container */}
      <View style={styles.brandWrapper}>
        
        {/* DYNAMIC MOVING TRUCK LOGO */}
        <Animated.View
          style={[
            styles.truckWrapper,
            {
              opacity: truckOpacity,
              transform: [
                { translateX: truckTranslateX },
                { rotate: truckRotate },
              ],
            },
          ]}
        >
          {/* colors.text used cleanly on top of primary solid branding */}
          <Icon name="truck-fast" size={64} color={colors.text} />
        </Animated.View>

        {/* REVEALED TEXT LAYER */}
        <Animated.View
          style={[styles.textMaskContainer, { width: textMaskWidth }]}
        >
          <Text
            style={{
              fontSize: 34,
              fontWeight: '800',
              color: colors.secondary, // Your standout secondary Orange brand anchor
              letterSpacing: -0.5,
              width: width * 0.85,
              textAlign: 'center',
            }}
          >
            ParcelMtaani
          </Text>
        </Animated.View>
      </View>

      {/* Subtitle & Accent Footer Layout */}
      <Animated.View style={{ opacity: elementsOpacity, alignItems: 'center' }}>
        <Text
          style={{
            fontSize: 13,
            color: colors.text,
            marginTop: 16,
            fontWeight: '600',
            letterSpacing: 1.5,
            opacity: 0.85, // Smooth blend down into theme background
          }}
        >
          SECURE PARCEL MANAGEMENT
        </Text>

        {/* Ground Horizon Visual Anchor */}
        <View
          style={{
            width: 140,
            height: 2,
            backgroundColor: colors.border || 'rgba(255,255,255,0.25)',
            marginTop: 20,
            borderRadius: 99,
          }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  brandWrapper: {
    width: '100%',
    height: 150, 
    justifyContent: 'flex-end',
    position: 'relative',
    paddingBottom: 12,
  },
  textMaskContainer: {
    height: 52,
    justifyContent: 'center',
    alignSelf: 'center',
    overflow: 'hidden',
    zIndex: 1,
  },
  truckWrapper: {
    position: 'absolute',
    top: 8, 
    zIndex: 2,
  },
});