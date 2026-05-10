/* eslint-disable react/no-unstable-nested-components */
import { createDrawerNavigator } from '@react-navigation/drawer';
import AdminDashboard from '../../screens/Dashboard';
import ParcelIntakeScreen from '../../screens/ParcelIntakeScreen';
import OnReceivingScreen from '../../screens/ArrivalToScreen';
import CustomDrawerContent from './CustomDrawer';
import StaffManagementScreen from '../../screens/staffScreen';
import TrucksManagementScreen from '../../screens/truckScreen';
import CustomHeader from '../../components/customHeader';
import ParcelStack from '../stacks/parcelStack';
import PickupManagementScreen from '../../screens/PickupManagementScreen';
import businessStack from '../stacks/businessStack';
import SuperSalesManagementScreen from '../../screens/superSalesScreen';
import NotificationPage from '../../screens/notificationScreen';
import AdminDailyPaymentScreen from '../../screens/adminPaymentScreen';
import { displayDate } from '../../utils/dates.utils';

const Drawer = createDrawerNavigator();

export default function RootDrawer() {
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
        name="notifications"
        options={() => ({
          header: () => <CustomHeader title="Notifications" />,
        })}
        component={NotificationPage}
      />
      <Drawer.Screen
        name="payments"
        options={() => ({
          header: () => <CustomHeader title={`${displayDate.toDateString()}`} />,
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
        component={businessStack}
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
        name="trucks"
        options={() => ({
          header: () => <CustomHeader title="Fleet Management" />,
        })}
        component={TrucksManagementScreen}
      />
    </Drawer.Navigator>
  );
}
