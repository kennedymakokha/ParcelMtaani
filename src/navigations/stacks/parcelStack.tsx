/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ParcelScreen from '../../screens/ParcelScreen';
import ParcelDetailsScreen from '../../screens/parceldetailsScreen';
import CustomHeader from '../../components/customHeader';

const Stack = createNativeStackNavigator();

export default function ParcelStack() {
  return (
    <Stack.Navigator initialRouteName="Parcels">
      <Stack.Screen
        options={() => ({
          header: () => <CustomHeader  title="Parcels" />,
        })}
        name="Parcels"
        component={ParcelScreen}
      />
      <Stack.Screen
        options={({ route }) => ({
        header: () => (
          <CustomHeader
          back
            title={(route.params as any)?.parcel?.code || "Parcel Details"}
          />
        ),
      })}
        name="ParcelDetails"
        component={ParcelDetailsScreen}
      />
    </Stack.Navigator>
  );
}
