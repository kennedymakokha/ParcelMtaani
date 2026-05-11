import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveFailedPrint = async (data: any) => {
  try {
    const stored = await AsyncStorage.getItem('failed_prints');

    const failedPrints = stored ? JSON.parse(stored) : [];

    failedPrints.push(data);

    await AsyncStorage.setItem(
      'failed_prints',
      JSON.stringify(failedPrints),
    );
  } catch (error) {
    console.log(error);
  }
};