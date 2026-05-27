/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/themeContext';

interface ToastProps {
  msg: string;
  state: 'success' | 'error' | 'warning' | string;
  setMsg: (msg: string) => void | any;
  small?: boolean;
  position?: 'top' | 'bottom';
}

const Toast = ({
  msg,
  state,
  setMsg,
  small,
  position = 'bottom',
}: ToastProps) => {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(
    new Animated.Value(position === 'top' ? -20 : 20),
  ).current;

  useEffect(() => {
    if (msg) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: position === 'top' ? -10 : 10,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => setMsg(''));
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [msg, position, setMsg, opacity, translateY]);

  if (!msg) return null;

  // Multi-state configuration mapping architecture
  const getToastConfig = () => {
    switch (state) {
      case 'error':
        return {
          title: 'Attention',
          icon: 'alert-circle-outline',
          iconSmall: 'close',
          color: colors.error || '#dc2626',
          bg: colors.errorLight || '#fef2f2',
        };
      case 'warning':
      case 'info':
        return {
          title: 'Notice',
          icon: 'warning-outline',
          iconSmall: 'warning',
          color: colors.secondary || '#f97316', // Core Secondary Orange Highlight
          bg: colors.warningLight || `${colors.secondary}15` || '#fff7ed',
        };
      case 'success':
      default:
        return {
          title: 'Success',
          icon: 'checkmark-circle-outline',
          iconSmall: 'checkmark',
          color: colors.success || '#16a34a',
          bg: colors.successLight || '#f0fdf4',
        };
    }
  };

  const config = getToastConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
          [position]: Platform.OS === 'ios' ? 60 : 40,
        },
      ]}
    >
      <View
        style={[
          styles.toastCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderLeftColor: config.color,
          },
        ]}
      >
        {small ? (
          <View style={[styles.smallCircle, { backgroundColor: config.bg }]}>
            <Icon name={config.iconSmall} size={16} color={config.color} />
          </View>
        ) : (
          <View style={styles.fullContent}>
            <View style={[styles.iconWrapper, { backgroundColor: config.bg }]}>
              <Icon name={config.icon} size={22} color={config.color} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.statusTitle, { color: config.color }]}>
                {config.title}
              </Text>
              <Text style={[styles.msgText, { color: colors.text }]}>
                {msg}
              </Text>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// ==========================================
// REFINED INTERFACING CONTAINER STYLING
// ==========================================
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    paddingHorizontal: 20,
  },
  toastCard: {
    width: '100%',
    maxWidth: 400,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 5,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
  smallCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  statusTitle: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  msgText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
  },
});

export default Toast;
