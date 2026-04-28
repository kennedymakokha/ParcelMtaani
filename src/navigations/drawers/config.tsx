import { UserRole } from '../../../types';

export const drawerConfig: Record<
  UserRole,
  { label: string; icon: string; screen: string }[]
> = {
  superadmin: [
    { label: 'Dashboard', icon: 'stats-chart', screen: 'Dashboard' },
    { label: 'Parcel Intake', icon: 'cube-outline', screen: 'Parcel Intake' },
    { label: 'On Receiving', icon: 'qr-code-outline', screen: 'On Receiving' },
    { label: 'Delivery', icon: 'car-outline', screen: 'Delivery' },
    { label: 'Reports', icon: 'document-text-outline', screen: 'Reports' },
  ],
  admin: [
    { label: 'Dashboard', icon: 'stats-chart', screen: 'Dashboard' },
   { label: 'Staff Management', icon: 'people-outline', screen: 'staff' },
    { label: 'Trucks', icon: 'truck', screen: 'trucks' },
    { label: 'Parcel Intake', icon: 'cube-outline', screen: 'Parcel Intake' },
    { label: 'On Receiving', icon: 'qr-code-outline', screen: 'On Receiving' },
    { label: 'Delivery', icon: 'car-outline', screen: 'Delivery' },
    { label: 'Reports', icon: 'document-text-outline', screen: 'Parcels' },

  ],
  staff: [
    { label: 'Parcel Intake', icon: 'cube-outline', screen: 'Parcel Intake' },
    { label: 'On Receiving', icon: 'qr-code-outline', screen: 'On Receiving' },
  ],
  agent: [{ label: 'Delivery', icon: 'car-outline', screen: 'Delivery' }],
  customer: [
    { label: 'My Parcels', icon: 'cube-outline', screen: 'CustomerParcels' },
    { label: 'Track Parcel', icon: 'search-outline', screen: 'TrackParcel' },
  ],
};
