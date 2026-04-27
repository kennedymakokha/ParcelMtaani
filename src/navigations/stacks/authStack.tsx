import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../../screens/LoginScreen";



const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen options={{headerShown:false}} name="Login" component={LoginScreen} />
       
      </Stack.Navigator>
   
  );
}
