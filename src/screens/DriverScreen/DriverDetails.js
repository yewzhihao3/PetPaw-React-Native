// DriverDetailsScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { getDriverData } from "../API/apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const DriverDetailsScreen = () => {
  const [driverData, setDriverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const driverId = await AsyncStorage.getItem("userId");
        const token = await AsyncStorage.getItem("userToken");
        if (driverId && token) {
          const data = await getDriverData(driverId, token);
          setDriverData(data);
        }
      } catch (error) {
        console.error("Error fetching driver data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDriverData();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("userId");
            await AsyncStorage.removeItem("userToken");
            // Add any other items you want to remove from AsyncStorage
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          } catch (error) {
            console.error("Error during logout:", error);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5E17EB" />
      </View>
    );
  }

  if (!driverData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load driver data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={
          driverData.image_url
            ? { uri: driverData.image_url }
            : require("../../../assets/E-Commerce/rider.jpg")
        }
        style={styles.profileImage}
      />
      <Text style={styles.name}>{driverData.name}</Text>
      <Text style={styles.detail}>Email: {driverData.email}</Text>
      <Text style={styles.detail}>Phone: {driverData.phone_number}</Text>
      <Text style={styles.detail}>Vehicle Type: {driverData.vehicle_type}</Text>
      <Text style={styles.detail}>
        License Plate: {driverData.license_plate}
      </Text>
      <Text style={styles.detail}>Status: {driverData.status}</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F0F0F0",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    marginBottom: 5,
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: "#5E17EB",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DriverDetailsScreen;
