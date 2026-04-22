import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import AdminDashboard from "../../screens/AdminDashboard";
import ParcelIntakeScreen from "../../screens/ParcelIntakeScreen";
import OnReceivingScreen from "../../screens/ArrivalToScreen";
import CustomDrawerContent from "./CustomDrawer";


const Drawer = createDrawerNavigator();

export default function RootDrawer() {
  return (
  
      <Drawer.Navigator
        initialRouteName="Dashboard"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: "#2563eb" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Drawer.Screen name="Dashboard" component={AdminDashboard} />
        <Drawer.Screen name="Parcel Intake" component={ParcelIntakeScreen} />
        <Drawer.Screen name="On Receiving" component={OnReceivingScreen} />
        <Drawer.Screen name="Delivery" component={OnReceivingScreen} />
        </Drawer.Navigator>
  );
}
