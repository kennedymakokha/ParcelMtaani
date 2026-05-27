/* eslint-disable react-native/no-inline-styles */
import React, { useRef, useState } from 'react';
import { Text, View, TouchableOpacity, Animated, Easing, StyleSheet, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/themeContext';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export interface ActionButton {
  icon?: IoniconName;
  label?: string;
  onPress: () => void;
  color?: string;
}

interface RadialFabProps {
  actions?: ActionButton[];
  mainAction?: () => void;
  mainColor?: string;
  mainIcon?: IoniconName;
  radius?: number;
  angle?: number;
  size?: number;
}

const RadialFab = ({
  actions = [],
  mainAction,
  mainColor,
  mainIcon = 'add-outline',
  radius = 100,
  angle = 90,
  size = 56, // Industry standard optimized sizing metric
}: RadialFabProps) => {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  // Uses Secondary Orange for maximum action prominence, falling back cleanly
  const activeMainBg = mainColor || colors.secondary || '#f97316';

  const toggleFab = () => {
    if (actions.length === 0) {
      mainAction?.();
      return;
    }

    Animated.timing(animation, {
      toValue: open ? 0 : 1,
      duration: 300,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    }).start();

    setOpen(!open);
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Sub-Action Flyout Group */}
      {actions.map((action, index) => {
        const step = actions.length > 1 ? angle / (actions.length - 1) : 0;
        const theta = (step * index * Math.PI) / 180;

        const translateX = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -radius * Math.cos(theta)],
        });

        const translateY = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -radius * Math.sin(theta)],
        });

        const scale = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.smallFab,
              {
                transform: [{ translateX }, { translateY }, { scale }],
                opacity: animation,
                // Adapts surface colors for perfect dark/light contrast parity
                backgroundColor: action.color || colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                action.onPress();
                toggleFab();
              }}
              style={styles.touchTarget}
              activeOpacity={0.7}
              accessibilityLabel={action.label || 'Action button'}
            >
              {action.icon ? (
                <Ionicons 
                  name={action.icon} 
                  size={18} 
                  color={action.color ? '#ffffff' : colors.text} 
                />
              ) : (
                <Text style={[styles.labelText, { color: colors.text }]}>
                  {action.label}
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      {/* Main Core Floating Trigger Component */}
      <TouchableOpacity
        style={[
          styles.mainFab,
          { 
            backgroundColor: activeMainBg, 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            // Deep tactical elevation pop
            shadowColor: activeMainBg,
          },
        ]}
        onPress={toggleFab}
        activeOpacity={0.85}
        accessibilityLabel="Main action button"
      >
        <Animated.View
          style={{
            transform: [
              {
                rotate: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '135deg'],
                }),
              },
            ],
          }}
        >
          {/* High-visibility white icon text tracking layout over orange fill */}
          <Ionicons name={mainIcon} size={26} color="#ffffff" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

// ==========================================
// ELEVATED SYSTEM DISPLAY STYLING
// ==========================================
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: Platform.OS === 'ios' ? 100 : 85,
    right: 24,
    zIndex: 9999,
  },
  mainFab: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: Platform.OS === 'ios' ? 0 : 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    ...Platform.select({
      ios: {
        shadowOpacity: 0.35,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 5 },
      },
      android: {
        elevation: 12,
      },
    }),
  },
  smallFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 6,
      },
    }),
  },
  touchTarget: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});

export default RadialFab;