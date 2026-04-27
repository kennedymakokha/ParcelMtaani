/* eslint-disable react/no-unstable-nested-components */
import { createDrawerNavigator } from '@react-navigation/drawer';
import AdminDashboard from '../../screens/AdminDashboard';
import ParcelIntakeScreen from '../../screens/ParcelIntakeScreen';
import OnReceivingScreen from '../../screens/ArrivalToScreen';
import CustomDrawerContent from './CustomDrawer';
import StaffManagementScreen from '../../screens/staffScreen';
import TrucksManagementScreen from '../../screens/truckScreen';
import CustomHeader from '../../components/customHeader';

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
          header: () => (
            <CustomHeader
              title="Dashboard"
            />
          ),
        })}
        component={AdminDashboard}
      />
      <Drawer.Screen
        name="Parcel Intake"
        options={() => ({
          header: () => (
            <CustomHeader
              title="Parcel Intake"
            />
          ),
        })}
        component={ParcelIntakeScreen}
      />
      <Drawer.Screen
        name="On Receiving"
        options={() => ({
          header: () => (
            <CustomHeader
              title="On Receiving"
            />
          ),
        })}
        component={OnReceivingScreen}
      />
      <Drawer.Screen
        name="Delivery"
        options={() => ({
          header: () => (
            <CustomHeader
              title="Delivery"
            />
          ),
        })}
        component={OnReceivingScreen}
      />
      <Drawer.Screen
        name="staff"
        options={() => ({
          header: () => (
            <CustomHeader
              title="Staff Management"
            />
          ),
        })}
        component={StaffManagementScreen}
      />
      <Drawer.Screen
        name="trucks"
        options={() => ({
          header: () => (
            <CustomHeader
              title="Trucks Management"
            />
          ),
        })}
        component={TrucksManagementScreen}
      />
    </Drawer.Navigator>
  );
}
