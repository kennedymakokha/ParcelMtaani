import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../../screens/LoginScreen";
import ParcelIntakeScreen from "../../screens/ParcelIntakeScreen";
import DeliveryScreen from "../../screens/DeliveryScreen";
import AdminDashboard from "../../screens/AdminDashboard";


const Stack = createNativeStackNavigator();

export default function RootStack() {
  return (
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Parcel Intake" component={ParcelIntakeScreen} />
        <Stack.Screen name="Delivery" component={DeliveryScreen} />
        <Stack.Screen name="Admin Dashboard" component={AdminDashboard} />
      </Stack.Navigator>
   
  );
}
