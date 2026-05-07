import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../../screens/LoginScreen";
import ForgotPasswordScreen from "../../screens/forgotPasswordScreen";
import SplashScreen from "../../screens/splashScreen";



const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
      <Stack.Navigator initialRouteName="splash">
            <Stack.Screen options={{headerShown:false}} name="splash" component={SplashScreen} />
        <Stack.Screen options={{headerShown:false}} name="Login" component={LoginScreen} />
        <Stack.Screen options={{headerShown:false}} name="forgot password" component={ForgotPasswordScreen} />
    
       
      </Stack.Navigator>
   
  );
}
