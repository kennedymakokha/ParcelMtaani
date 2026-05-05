/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useTheme } from './../../contexts/themeContext';

export const SkeletonBlock = ({ height, style }: any) => {
  const { colors } = useTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={[
        {
          height,
          backgroundColor: colors.card,
          borderRadius: 8,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          position: 'absolute',
          width: '40%',
          height: '100%',
          backgroundColor: colors.border,
          opacity: 0.4,
          transform: [{ translateX }],
        }}
      />
    </View>
  );
};
