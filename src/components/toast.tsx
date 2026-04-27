/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/themeContext';


const Toast = ({ msg, state, setMsg, small, position = 'bottom' }: any) => {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(position === 'top' ? -20 : 20)).current;

  useEffect(() => {
    if (msg) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: position === 'top' ? -10 : 10, duration: 300, useNativeDriver: true }),
        ]).start(() => setMsg(""));
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [msg, position, setMsg, opacity, translateY]);

  if (!msg) return null;

  const isError = state === "error";
  const statusColor = isError ? colors.error : colors.success;
  const statusBg = isError ? colors.errorLight : colors.successLight;

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
            borderLeftColor: statusColor,
          },
        ]}
      >
        {small ? (
          <View style={[styles.smallCircle, { backgroundColor: statusBg }]}>
            <Icon name={isError ? "close" : "checkmark"} size={16} color={statusColor} />
          </View>
        ) : (
          <View style={styles.fullContent}>
            <View style={[styles.iconWrapper, { backgroundColor: statusBg }]}>
              <Icon
                name={isError ? "alert-circle-outline" : "checkmark-circle-outline"}
                size={22}
                color={statusColor}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.statusTitle, { color: statusColor }]}>
                {isError ? "Attention" : "Success"}
              </Text>
              <Text style={[styles.msgText, { color: colors.text }]}>{msg}</Text>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

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
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 8 },
    }),
  },
  smallCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
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
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  msgText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default Toast;
