import React from 'react';
import { View } from 'react-native';

export default function TruckCardSkeleton() {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3">

      {/* Plate */}
      <View className="h-5 w-32 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />

      {/* Model */}
      <View className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded mt-3 animate-pulse" />

      {/* Capacity */}
      <View className="h-4 w-28 bg-gray-300 dark:bg-gray-700 rounded mt-2 animate-pulse" />

      {/* Driver section */}
      <View className="mt-4 space-y-2 gap-y-2">
        <View className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />

        <View className="h-3 w-40 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
        <View className="h-3 w-32 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
      </View>

      {/* Buttons */}
      <View className="flex-row justify-end mt-5 space-x-3 gap-x-2">
        <View className="h-9 w-16 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse" />
        <View className="h-9 w-16 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse" />
      </View>
    </View>
  );
}