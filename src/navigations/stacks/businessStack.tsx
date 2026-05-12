/* eslint-disable react/no-unstable-nested-components */
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CustomHeader from '../../components/customHeader';
import BusinessManagementScreen from '../../screens/business/business';
import BusinessDetailScreen from '../../screens/business/BusinessDetailScreen';

const Stack = createNativeStackNavigator();

export default function BusinessStack() {
  return (
    <Stack.Navigator initialRouteName="businesses">
      <Stack.Screen
        options={() => ({
          header: () => <CustomHeader title="Businesses" />,
        })}
        name="businesses"
        component={BusinessManagementScreen}
      />
      <Stack.Screen
        options={({ route }: any) => ({
          header: () => {
            return (
              <CustomHeader
                back
                title={route.params.item.business_name || 'Parcel Details'}
              />
            );
          },
        })}
        name="BusinessDetail"
        component={BusinessDetailScreen}
      />
    </Stack.Navigator>
  );
}
