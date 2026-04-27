import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import RootDrawer from "../drawers/rootDrawer";


const Stack = createNativeStackNavigator();

export default function RootStack() {
  return (
      <Stack.Navigator initialRouteName="DashboardStack">
       
        <Stack.Screen options={{headerShown:false}} name="DashboardStack" component={RootDrawer} />
     
      </Stack.Navigator>
   
  );
}
