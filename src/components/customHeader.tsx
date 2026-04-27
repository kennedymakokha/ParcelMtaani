/* eslint-disable react/no-unstable-nested-components */
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

import { useState } from 'react';
import { useTheme } from '../contexts/themeContext';

// Notification Badge
const NotificationBadge = ({ count }: { count: number }) => {
  const { colors } = useTheme();
  if (count <= 0) return null;
  return (
    <View
      style={[
        styles.badgeContainer,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.badgeText, { color: colors.error }]}>
        {count > 9 ? '9+' : count}
      </Text>
    </View>
  );
};

function CustomHeader({
  title,
  back,
  nodetails,
}: {
  title: string;
  add?: boolean;
  back?: boolean;
  nodetails?: boolean;
}) {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [menuVisible, setMenuVisible] = useState(false);
  const notificationCount = 5;


  const MenuOption = ({ icon, label, onPress, color }: any) => (
    <TouchableOpacity onPress={onPress} style={styles.menuItem}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.menuText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={{ backgroundColor: colors.primary }}
      className="flex-row items-center justify-between p-4 shadow-md"
    >
      <View className="flex-row items-center">
        {back ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-2"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            className="mr-4"
          >
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        <Text
          style={{ color: colors.text }}
          className="text-lg uppercase font-semibold tracking-widest"
        >
          {title}
        </Text>
      </View>

      {!nodetails && (
        <View className="flex-row items-center gap-x-4">
          
          <TouchableOpacity
            //   onPress={() => navigation.navigate("Notifications" as any)}
            className="relative p-1"
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.secondary}
            />
            <NotificationBadge count={notificationCount} />
          </TouchableOpacity>
          {/* <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            className="p-1"
          >
            <Ionicons
              name="ellipsis-vertical"
              size={22}
              color={colors.secondary}
            />
          </TouchableOpacity> */}
        </View>
      )}

      {/* Dropdown Menu */}
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
              {/* <View style={styles.menuItem}>
                <Ionicons name={isDarkMode ? "moon" : "sunny-outline"} size={20} color={isDarkMode ? colors.primary : colors.warning} />
                <Text style={[styles.menuText, { color: colors.text, flex: 1 }]}>
                  {isDarkMode ? "Dark Mode" : "Light Mode"}
                </Text>
                <Switch
                  value={isDarkMode}
                  onValueChange={(value) => setDarkMode(value)}
                  trackColor={{ false: colors.border, true: colors.primary + "80" }}
                  thumbColor={isDarkMode ? colors.primary : colors.card}
                />
              </View> */}
              <MenuOption
                icon="refresh-outline"
                label="Sync Data"
                onPress={() => setMenuVisible(false)}
                color={colors.text}
              />
              <MenuOption
                icon="settings-outline"
                label="Settings"
                onPress={() => setMenuVisible(false)}
                color={colors.text}
              />
              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />
              <MenuOption
                icon="log-out-outline"
                label="Logout"
                onPress={() => setMenuVisible(false)}
                color={colors.error}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'transparent' },
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
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuText: { fontSize: 15, fontWeight: '600' },
  divider: { height: 1, marginVertical: 4, marginHorizontal: 16 },
  badgeContainer: {
    position: 'absolute',
    right: -2,
    top: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
  },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
});

export default CustomHeader;
