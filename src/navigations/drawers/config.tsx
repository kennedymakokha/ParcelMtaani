import { UserRole } from '../../../types';
import { displayDate } from '../../utils/dates.utils';

export const getDrawerConfig = (
  pickupState: string,
): Record<UserRole, { label: string; icon: string; screen: string }[]> => ({
  superuser: [
    { label: 'Dashboard', icon: 'stats-chart', screen: 'Dashboard' },
    { label: 'Business Management', icon: 'bus-outline', screen: 'Business' },
    {
      label: 'Sales Persons',
      icon: 'people-outline',
      screen: 'sales person management',
    },
  ],

  supersales: [
    { label: 'Dashboard', icon: 'stats-chart', screen: 'Dashboard' },
    { label: 'Business Management', icon: 'bus-outline', screen: 'Business' },
  ],

  superadmin: [
    { label: 'Dashboard', icon: 'stats-chart', screen: 'Dashboard' },
    { label: 'Fleet Management', icon: 'bus-outline', screen: 'Business' },
    {
      label: 'Pickup Management',
      icon: 'people-outline',
      screen: 'pickup management',
    },
    { label: 'Fleet Management', icon: 'bus-outline', screen: 'trucks' },
    {
      label: 'Parcel Recieval & Loading',
      icon: 'cube-outline',
      screen: 'Parcel Intake',
    },
    { label: 'Offloading', icon: 'qr-code-outline', screen: 'On Receiving' },
    { label: 'Reports', icon: 'document-text-outline', screen: 'Parcels' },
  ],

  admin: [
    { label: 'Dashboard', icon: 'stats-chart', screen: 'Dashboard' },

    { label: 'Staff Management', icon: 'people-outline', screen: 'staff' },

    {
      label: 'Parcel Recieval & Loading',
      icon: 'cube-outline',
      screen: 'Parcel Intake',
    },

    { label: 'Offloading', icon: 'qr-code-outline', screen: 'On Receiving' },

    { label: 'Reports', icon: 'document-text-outline', screen: 'Parcels' },

    ...(pickupState === 'pickup_shut'
      ? [
          {
            label: `${displayDate.toDateString()} Subscription`,
            icon: 'calendar-outline',
            screen: 'payments',
          },
        ]
      : []),
  ],

  staff: [
    {
      label: 'Parcel Recieval & Loading',
      icon: 'cube-outline',
      screen: 'Parcel Recieval & Loading',
    },
    {
      label: 'On Receiving',
      icon: 'qr-code-outline',
      screen: 'On Receiving',
    },
  ],

  agent: [{ label: 'Delivery', icon: 'car-outline', screen: 'Delivery' }],

  customer: [
    {
      label: 'My Parcels',
      icon: 'cube-outline',
      screen: 'CustomerParcels',
    },
    {
      label: 'Track Parcel',
      icon: 'search-outline',
      screen: 'TrackParcel',
    },
  ],
});