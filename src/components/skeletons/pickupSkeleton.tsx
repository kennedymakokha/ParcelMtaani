import { View } from "react-native";

 const PickupSkeleton = () => {
  return (
    <View className="space-y-3">
      {[...Array(6)].map((_, index) => (
        <View
          key={index}
          className="border rounded-xl p-4 border-gray-200 dark:border-gray-700"
        >
          <View className="h-5 w-2/3 bg-gray-300 dark:bg-gray-700 rounded mb-3" />
          <View className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
          <View className="h-4 w-1/3 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
          <View className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded" />
        </View>
      ))}
    </View>
  );
};

export default PickupSkeleton