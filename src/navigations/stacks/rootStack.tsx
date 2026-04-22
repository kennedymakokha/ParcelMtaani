import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../../screens/LoginScreen";

import RootDrawer from "../drawers/rootDrawer";


const Stack = createNativeStackNavigator();

export default function RootStack() {
  return (
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen options={{headerShown:false}} name="Login" component={LoginScreen} />
        <Stack.Screen options={{headerShown:false}} name="DashboardStack" component={RootDrawer} />
     
      </Stack.Navigator>
   
  );
}
