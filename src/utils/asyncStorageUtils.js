// src/utils/asyncStorageUtils.js
import AsyncStorage from "@react-native-async-storage/async-storage";

// Function to log stored data
export const logStoredData = async () => {
  try {
    const userToken = await AsyncStorage.getItem("userToken");
    const userId = await AsyncStorage.getItem("userId");
    console.log("Stored User Token:", userToken);
    console.log("Stored User ID:", userId);
  } catch (err) {
    console.log("Error fetching stored data:", err);
  }
};

// Function to get user data
export const getUserData = async () => {
  try {
    const userToken = await AsyncStorage.getItem("userToken");
    const userId = await AsyncStorage.getItem("userId");
    return { userToken, userId };
  } catch (err) {
    console.log("Error fetching user data:", err);
    return null;
  }
};
