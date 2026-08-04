/* eslint-disable react/no-unstable-nested-components */
import { createDrawerNavigator } from '@react-navigation/drawer';
import AdminDashboard from '../../screens/Dashboard';
import ParcelIntakeScreen from '../../screens/ParcelIntakeScreen';
import OnReceivingScreen from '../../screens/ArrivalToScreen';
import CustomDrawerContent from './CustomDrawer';
import StaffManagementScreen from '../../screens/staffScreen';

import CustomHeader from '../../components/customHeader';
import ParcelStack from '../stacks/parcelStack';

import BusinessStack from '../stacks/businessStack';
import SuperSalesManagementScreen from '../../screens/salesPsersons/superSalesScreen';
import NotificationPage from '../../screens/notificationScreen';
import AdminDailyPaymentScreen from '../../screens/adminPaymentScreen';
import { displayDate } from '../../utils/dates.utils';
import CancelledParcelsScreen from '../../screens/canceledParcel';
import ProfileScreen from '../../screens/ProfileScreen';
import PickupManagementScreen from '../../screens/pickup/PickupManagementScreen';
import TrucksManagementScreen from '../../screens/fleet/truckScreen';
import BusinessProfileScreen from '../../screens/business/businessProfile';
import ParcelCashScreen from '../../screens/cash';
import PickupProfileScreen from '../../screens/business/pickupProfile';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearNotifications,
  markAllAsRead,
} from '../../features/notificationsSlice';
import { useSocket } from '../../contexts/socketContext';
import RouteManagementScreen from '../../screens/routes/routeManagementScreen';
import TicketingScreen from '../../screens/ticketing/TicketingScreen';

const Drawer = createDrawerNavigator();

export default function RootDrawer() {
  const { user:{_id} } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const { socket } = useSocket();
 
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#2563eb' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        options={() => ({
          header: () => <CustomHeader title="Dashboard" />,
        })}
        component={AdminDashboard}
      />
      <Drawer.Screen
        name="Profile"
        options={() => ({
          header: () => <CustomHeader title="Profile" />,
        })}
        component={ProfileScreen}
      />
      <Drawer.Screen
        name="Cancelled Parcels"
        options={() => ({
          header: () => <CustomHeader title="Cancelled" />,
        })}
        component={CancelledParcelsScreen}
      />
      <Drawer.Screen
        name="notifications"
        options={() => ({
          header: () => (
            <CustomHeader
              actions={[
                {
                  icon: 'checkmark-done-outline',
                  label: 'marks all as read',
                  onPress: () => {
                    dispatch(markAllAsRead());
                  },
                },
                {
                  icon: 'trash-outline',
                  label: 'clear all',
                  onPress: () => {
                    dispatch(clearNotifications());
                    if (socket) {
                      socket.emit('clearNotifications', { userId: _id }); // Emit event to clear notifications for the user
                    }
                  },
                },
               
              ]}
              back
              title="Notifications"
            />
          ),
        })}
        component={NotificationPage}
      />
      <Drawer.Screen
        name="payments"
        options={() => ({
          header: () => (
            <CustomHeader title={`${displayDate.toDateString()}`} />
          ),
        })}
        component={AdminDailyPaymentScreen}
      />
      <Drawer.Screen
        name="Parcel Intake"
        options={() => ({
          header: () => <CustomHeader title="Parcel Intake" />,
        })}
        component={ParcelIntakeScreen}
      />
      <Drawer.Screen
        name="sales person management"
        options={() => ({
          header: () => <CustomHeader title="Super Sales" />,
        })}
        component={SuperSalesManagementScreen}
      />
      <Drawer.Screen
        name="On Receiving"
        options={() => ({
          header: () => <CustomHeader title="On Receiving" />,
        })}
        component={OnReceivingScreen}
      />
      <Drawer.Screen
        name="Business"
        options={{ headerShown: false }}
        component={BusinessStack}
      />
      <Drawer.Screen
        name="pickup management"
        options={() => ({
          header: () => <CustomHeader title="Pickup Management" />,
        })}
        component={PickupManagementScreen}
      />
      <Drawer.Screen
        name="Parcels"
        options={{ headerShown: false }}
        component={ParcelStack}
      />
      <Drawer.Screen
        name="Business profile"
        options={() => ({
          header: () => <CustomHeader title="MY Business" />,
        })}
        component={BusinessProfileScreen}
      />
      <Drawer.Screen
        name="Pickup profile"
        options={() => ({
          header: () => <CustomHeader title="MY Pickup Station" />,
        })}
        component={PickupProfileScreen}
      />

      <Drawer.Screen
        name="Delivery"
        options={() => ({
          header: () => <CustomHeader title="Delivery" />,
        })}
        component={OnReceivingScreen}
      />
      <Drawer.Screen
        name="staff"
        options={() => ({
          header: () => <CustomHeader title="Staff Management" />,
        })}
        component={StaffManagementScreen}
      />
      <Drawer.Screen
        name="Todays cash Records"
        options={() => ({
          header: () => <CustomHeader title="Todays Cash Flow" />,
        })}
        component={ParcelCashScreen}
      />
      <Drawer.Screen
        name="trucks"
        options={() => ({
          header: () => <CustomHeader title="Fleet Management" />,
        })}
        component={TrucksManagementScreen}
      />
        <Drawer.Screen
        name="routes"
        options={() => ({
          header: () => <CustomHeader title="Route Management" />,
        })}
        component={RouteManagementScreen}
      />
       <Drawer.Screen
        name="Tickets"
        options={() => ({
          header: () => <CustomHeader title="Tickets & Seats" />,
        })}
        component={TicketingScreen}
      />
    </Drawer.Navigator>
  );
}
