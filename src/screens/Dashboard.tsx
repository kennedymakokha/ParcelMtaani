/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import AdminDashboard from './dashboards/admin';
import SuperUserDashboard from './dashboards/superUser';
import SalesDashboard from './dashboards/sales';
export default function DashboardScreen() {

  const {
    user: { role },
  } = useSelector((state: any) => state.auth);

  return (
    <View style={{ flex: 1 }}>
      {role === 'admin' || role === 'attendant' ? (
        <AdminDashboard />
      ) : role === 'superuser' ? (
        <SuperUserDashboard />
      ) : (
        <SalesDashboard />
      )}
    </View>
  );
}
