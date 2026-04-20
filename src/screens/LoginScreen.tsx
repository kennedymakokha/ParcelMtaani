import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";

export default function LoginScreen({ navigation }:any) {
  return (
    <View className="flex-1 justify-center items-center bg-red-900 p-6">
      <Text className="text-2xl font-bold mb-6">Parcel System Login</Text>
      <TextInput
        className="w-full border border-gray-300 rounded-lg p-3 mb-4"
        placeholder="Email"
      />
      <TextInput
        className="w-full border border-gray-300 rounded-lg p-3 mb-4"
        placeholder="Password"
        secureTextEntry
      />
      <TouchableOpacity
        className="bg-blue-600 w-full p-3 rounded-lg"
        onPress={() => navigation.navigate("Parcel Intake")}
      >
        <Text className="text-white text-center font-semibold">Login</Text>
      </TouchableOpacity>
    </View>
  );
}
