import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserData } from "../API/apiService";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { themeColors } from "../../../theme";
import { Ionicons } from "@expo/vector-icons";
import Navbar from "../../components/HomeScreen/Navbar";
import { useTheme } from "../../../theme/Themecontext";

const InfoItem = ({ label, value, isDarkMode }) => (
  <View style={styles.infoItem}>
    <Text style={[styles.infoLabel, isDarkMode && styles.darkText]}>
      {label}:
    </Text>
    <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
      {value}
    </Text>
  </View>
);

export default function DataScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const { isDarkMode, toggleTheme } = useTheme();

  const navigateToAddAddress = () => {
    navigation.navigate("AddAddress");
  };

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const token = await AsyncStorage.getItem("userToken");
          const userId = await AsyncStorage.getItem("userId");
          if (!token || !userId) {
            throw new Error("No token or user ID found");
          }
          const result = await getUserData(userId, token);
          if (result && typeof result === "object") {
            setData(result);
          } else {
            throw new Error("Invalid data received from server");
          }
        } catch (error) {
          console.error(
            "Error fetching data:",
            error.response?.data || error.message
          );
          setError("Unable to fetch data. Please log in again.");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("userRole");
      setData(null);
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return (
      <View
        style={[styles.centeredContainer, isDarkMode && styles.darkContainer]}
      >
        <ActivityIndicator
          size="large"
          color={isDarkMode ? "#ffffff" : "#0000ff"}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.centeredContainer, isDarkMode && styles.darkContainer]}
      >
        <Text style={[styles.errorText, isDarkMode && styles.darkText]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: themeColors.bgColor(1) }]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!data) {
    return (
      <View
        style={[styles.centeredContainer, isDarkMode && styles.darkContainer]}
      >
        <Text style={[styles.errorText, isDarkMode && styles.darkText]}>
          No user data available. Please try logging in again.
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: themeColors.bgColor(1) }]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, isDarkMode && styles.darkContainer]}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Home")}
            style={styles.headerButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDarkMode ? "white" : "black"}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>
            Profile
          </Text>
          <TouchableOpacity onPress={toggleTheme} style={styles.headerButton}>
            <Ionicons
              name={isDarkMode ? "sunny" : "moon"}
              size={24}
              color={isDarkMode ? "white" : "black"}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          {data.profile_picture && (
            <Image
              source={{ uri: data.profile_picture }}
              style={styles.profilePicture}
            />
          )}
          <Text style={[styles.name, isDarkMode && styles.darkText]}>
            {data.name || "N/A"}
          </Text>
          <View style={styles.infoContainer}>
            <InfoItem
              label="Email"
              value={data.email || "N/A"}
              isDarkMode={isDarkMode}
            />
            <InfoItem
              label="Phone"
              value={data.phone_number || "N/A"}
              isDarkMode={isDarkMode}
            />
            <InfoItem
              label="Role"
              value={data.role || "N/A"}
              isDarkMode={isDarkMode}
            />
            <InfoItem
              label="ID"
              value={data.id?.toString() || "N/A"}
              isDarkMode={isDarkMode}
            />
            <InfoItem
              label="Created At"
              value={
                data.created_at
                  ? new Date(data.created_at).toLocaleString()
                  : "N/A"
              }
              isDarkMode={isDarkMode}
            />
            <InfoItem
              label="Email Verified"
              value={data.email_verified ? "Yes" : "No"}
              isDarkMode={isDarkMode}
            />
            <InfoItem
              label="Active"
              value={data.is_active ? "Yes" : "No"}
              isDarkMode={isDarkMode}
            />
            <InfoItem
              label="Last Login"
              value={
                data.last_login
                  ? new Date(data.last_login).toLocaleString()
                  : "Never"
              }
              isDarkMode={isDarkMode}
            />
            {data.addresses && data.addresses.length > 0 && (
              <View>
                <Text style={[styles.infoLabel, isDarkMode && styles.darkText]}>
                  Address:
                </Text>
                <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                  {`${data.addresses[0].address_line1}, ${
                    data.addresses[0].address_line2 || ""
                  } ${data.addresses[0].city}, ${data.addresses[0].state}, ${
                    data.addresses[0].country
                  }, ${data.addresses[0].postal_code}`}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: themeColors.bgColor(0.9) },
              ]}
              onPress={navigateToAddAddress}
            >
              <Text style={styles.buttonText}>Add New Address</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: themeColors.bgColor(0.9) },
            ]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  darkContainer: {
    backgroundColor: "#1E1E1E", // Slightly lighter dark mode color
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 90,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    alignItems: "center",
    padding: 16,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  infoContainer: {
    width: "100%",
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: "bold",
    color: "#555",
  },
  infoValue: {
    color: "#333",
  },
  button: {
    width: "80%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
    alignSelf: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  darkText: {
    color: "white",
  },
});
