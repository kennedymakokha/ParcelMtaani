import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function AdminDashboard() {
  return (
    <View className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold mb-4">Admin Dashboard</Text>
      <View className="flex-row justify-between mb-4">
        <View className="bg-blue-100 p-4 rounded-lg w-1/2 mr-2">
          <Text className="text-lg font-semibold">Parcels</Text>
          <Text>120 Active</Text>
        </View>
        <View className="bg-green-100 p-4 rounded-lg w-1/2 ml-2">
          <Text className="text-lg font-semibold">Delivered</Text>
          <Text>95 Completed</Text>
        </View>
      </View>
      <TouchableOpacity className="bg-purple-600 p-3 rounded-lg">
        <Text className="text-white text-center">Export Report</Text>
      </TouchableOpacity>
    </View>
  );
}
