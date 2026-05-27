import { UserRole } from '../../../types';
import { displayDate } from '../../utils/dates.utils';

export const getDrawerConfig = (
  pickupState: string,
  isPaid: boolean, // 💡 ADDED: Explicit status flag from your currentPickup profile state
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
    {
      label: 'Pickup Management',
      icon: 'people-outline',
      screen: 'pickup management',
    },
    { label: 'Fleet Management', icon: 'bus-outline', screen: 'trucks' },
    { label: 'Reports', icon: 'document-text-outline', screen: 'Parcels' },
  ],

  admin: [
    { label: 'Dashboard', icon: 'stats-chart', screen: 'Dashboard' },
    { label: 'Staff Management', icon: 'people-outline', screen: 'staff' },
    {
      label: 'Cash Flow',
      icon: 'wallet-outline',
      screen: 'Todays cash Records',
    },
    // {
    //   label: 'Parcel Recieval & Loading',
    //   icon: 'cube-outline',
    //   screen: 'Parcel Intake',
    // },
    { label: 'Reports', icon: 'document-text-outline', screen: 'Parcels' },

    // 💡 FIX: Appends subscription action link if station is shut OR subscription paid flag evaluates to false
    ...(pickupState === 'pickup_shut' || isPaid === false
      ? [
          {
            label: `${displayDate.toDateString()} Subscription`,
            icon: 'calendar-outline',
            screen: 'payments',
          },
        ]
      : []),
  ],

  attendant: [
    { label: 'Dashboard', icon: 'stats-chart', screen: 'Dashboard' },
    {
      label: 'Parcel Recieval & Loading',
      icon: 'cube-outline',
      screen: 'Parcel Intake',
    },
    { label: 'Offloading', icon: 'qr-code-outline', screen: 'On Receiving' },
    {
      label: 'Cancelled Parcels',
      icon: 'people-outline',
      screen: 'Cancelled Parcels',
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
