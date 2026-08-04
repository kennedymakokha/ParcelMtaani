/* eslint-disable react-native/no-inline-styles */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { useTheme } from '../../../contexts/themeContext';


export default function DashboardHeader() {
  const { colors } = useTheme();

  const { user } = useSelector(
    (state: RootState) => state.auth,
  );

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        },
      ]}>
      {/* Left */}
      <View style={styles.leftSection}>
        {/* <Image
          source={require('../../../assets/')}
          style={styles.logo}
          resizeMode="contain"
        /> */}

        <View>
          <Text
            style={[
              styles.company,
              {
                color: colors.text,
              },
            ]}>
            MARA PESA
          </Text>

          <Text
            style={[
              styles.module,
              {
                color: colors.secondary,
              },
            ]}>
            Ticket Booking Office
          </Text>
        </View>
      </View>

      {/* Center */}

      <View style={styles.centerSection}>
        <Icon
          name="calendar-month-outline"
          size={18}
          color={colors.primary}
        />

        <Text
          style={[
            styles.time,
            {
              color: colors.text,
            },
          ]}>
          {now.toLocaleDateString()}   {now.toLocaleTimeString()}
        </Text>
      </View>

      {/* Right */}

      <View style={styles.rightSection}>
        {/* Printer */}

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: '#E8F5E9',
            },
          ]}>
          <Icon
            name="printer-check"
            size={18}
            color="#2E7D32"
          />

          <Text
            style={{
              color: '#2E7D32',
              marginLeft: 6,
              fontWeight: '600',
            }}>
            Printer Ready
          </Text>
        </View>

        {/* Notification */}

        <TouchableOpacity
          style={[
            styles.iconButton,
            {
              backgroundColor: colors.background,
            },
          ]}>
          <Icon
            name="bell-outline"
            size={22}
            color={colors.text}
          />
        </TouchableOpacity>

        {/* User */}

        <TouchableOpacity
          style={[
            styles.userCard,
            {
              backgroundColor: colors.background,
            },
          ]}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: colors.primary,
              },
            ]}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>

          <View>
            <Text
              style={{
                color: colors.text,
                fontWeight: '700',
              }}>
              {user?.name || 'Booking Clerk'}
            </Text>

            <Text
              style={{
                color: colors.secondary,
                fontSize: 12,
              }}>
              Ticketing Desk
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 82,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 54,
    height: 54,
    marginRight: 12,
  },

  company: {
    fontSize: 22,
    fontWeight: '700',
  },

  module: {
    fontSize: 13,
    marginTop: 2,
  },

  centerSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  time: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
  },

  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 30,
    marginRight: 14,
  },

  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 50,
    borderRadius: 28,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  avatarText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});