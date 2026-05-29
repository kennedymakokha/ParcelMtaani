/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import { DrawerActions, useNavigation } from '@react-navigation/native';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useState } from 'react';
import { useTheme } from '../contexts/themeContext';
import { useAppSelector } from '../hooks/storehooks';

// ==========================================
// BRANDED NOTIFICATION BADGE (SECONDARY ACCENT)
// ==========================================
const NotificationBadge = ({ count }: { count: number }) => {
  const { colors } = useTheme();
  if (count <= 0) return null;

  return (
    <View
      style={[
        styles.badgeContainer,
        {
          backgroundColor: colors.secondary || '#f97316',
          borderColor: colors.card || '#ffffff',
        },
      ]}
    >
      <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
    </View>
  );
};

interface CustomHeaderProps {
  title: string;
  back?: boolean;
  nodetails?: boolean;
  actions?: any;
}

function CustomHeader({ title, back, nodetails, actions }: CustomHeaderProps) {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const notifications = useAppSelector(state => state.notifications.list);

  const MenuOption = ({ icon, label, onPress, color }: any) => (
    <TouchableOpacity onPress={onPress} style={styles.menuItem}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.menuText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.headerMainWrapper,
        {
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderColor: colors.border || '#e2e8f0',
        },
      ]}
    >
      {/* Left Navigation Matrix */}
      <View style={styles.leftLayoutGroup}>
        {back ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.hitTargetPadding}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={styles.hitTargetPadding}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        <Text
          numberOfLines={1}
          style={[styles.headerTitleText, { color: colors.text }]}
        >
          {title}
        </Text>
      </View>

      {/* Right Control Utility Group */}
      {!nodetails && (
        <View style={styles.rightLayoutGroup}>
          <TouchableOpacity
            onPress={() => navigation.navigate('notifications' as never)}
            style={styles.iconHitTarget}
            activeOpacity={0.7}
          >
            <Ionicons
              name="notifications-outline"
              size={23}
              color={colors.primary || '#2563eb'}
            />
            <NotificationBadge
              count={notifications.filter(e => !e.read).length}
            />
          </TouchableOpacity>
          {actions && (
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              style={styles.iconHitTarget}
              activeOpacity={0.7}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={22}
                color={colors.text}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Action Sheet Dropdown Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.dropdownMenu,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              {actions?.map((action: any, index: number) => (
                <MenuOption
                  key={index}
                  icon={action.icon}
                  label={action.label}
                  onPress={() => {
                    action.onPress();
                    setMenuVisible(false);
                  }}
                  color={colors.text}
                />
              ))}
            
              {/* <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />
              <MenuOption
                icon="log-out-outline"
                label="Logout"
                onPress={() => setMenuVisible(false)}
                color={colors.error || '#dc2626'}
              /> */}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

// ==========================================
// CLEAN CENTRALIZED STYLE ARCHITECTURE
// ==========================================
const styles = StyleSheet.create({
  headerMainWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    // Smooth structural shadow depth line
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 3,
  },
  leftLayoutGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightLayoutGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hitTargetPadding: {
    paddingVertical: 8,
    paddingRight: 14,
  },
  iconHitTarget: {
    padding: 6,
    position: 'relative',
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 60,
    right: 15,
    width: 180,
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 4,
    marginHorizontal: 16,
  },
  badgeContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#ffffff', // Ensures clear visibility against orange backgrounds
  },
});

export default CustomHeader;
