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
import { Ionicons } from "@expo/vector-icons";
import Navbar from "../../components/HomeScreen/Navbar";
import { useTheme } from "../../../theme/Themecontext";
import { getTheme, commonStyles } from "../../../theme/HomeTheme";

const InfoItem = ({ icon, value, isDarkMode, theme }) => (
  <View style={styles.infoItem}>
    <Ionicons
      name={icon}
      size={24}
      color={isDarkMode ? theme.primaryLight : theme.primary}
    />
    <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
  </View>
);

const placeholderImage = require("../../../assets/home/placeholder.jpg");

export default function UserProfile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const { isDarkMode, toggleTheme } = useTheme();
  const theme = getTheme(isDarkMode);

  const navigateToAddAddress = () => {
    navigation.navigate("AddAddress");
    console.log("Navigate to Add Address");
  };

  const navigateToAddPet = () => {
    // Commented out for now
    // navigation.navigate("AddPet");
    console.log("Navigate to Add Pet");
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
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View
        style={[styles.centeredContainer, isDarkMode && styles.darkContainer]}
      >
        <Text style={[styles.errorText, { color: theme.error }]}>
          {error || "No user data available. Please try logging in again."}
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View
          style={[styles.header, { backgroundColor: theme.headerBackground }]}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("Home")}
            style={styles.headerButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.buttonText} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.buttonText }]}>
            Profile
          </Text>
          <TouchableOpacity onPress={toggleTheme} style={styles.headerButton}>
            <Ionicons
              name={isDarkMode ? "sunny" : "moon"}
              size={24}
              color={theme.buttonText}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View
            style={[
              styles.profileCard,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <Image
              source={
                data.profile_picture
                  ? { uri: data.profile_picture }
                  : placeholderImage
              }
              style={[styles.profilePicture, { borderColor: theme.primary }]}
            />
            <Text style={[styles.name, { color: theme.text }]}>
              {data.name || "N/A"}
            </Text>
          </View>

          <View
            style={[styles.infoCard, { backgroundColor: theme.cardBackground }]}
          >
            <InfoItem
              icon="mail"
              value={data.email || "N/A"}
              isDarkMode={isDarkMode}
              theme={theme}
            />
            <InfoItem
              icon="call"
              value={data.phone_number || "N/A"}
              isDarkMode={isDarkMode}
              theme={theme}
            />
          </View>

          {data.addresses && data.addresses.length > 0 ? ( // change to 0 after finished editing new address
            <View
              style={[
                styles.addressCard,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Address
              </Text>
              <InfoItem
                icon="location"
                value={`${data.addresses[0].address_line1}, ${
                  data.addresses[0].address_line2 || ""
                } ${data.addresses[0].city}, ${data.addresses[0].state}, ${
                  data.addresses[0].country
                }, ${data.addresses[0].postal_code}`}
                isDarkMode={isDarkMode}
                theme={theme}
              />
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: theme.buttonBackground },
              ]}
              onPress={navigateToAddAddress}
            >
              <Text style={[styles.buttonText, { color: theme.buttonText }]}>
                Add New Address
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.buttonBackground }]}
            onPress={navigateToAddPet}
          >
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>
              Add Pet
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.logoutButton,
              { backgroundColor: theme.accent },
            ]}
            onPress={handleLogout}
          >
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>
              Log Out
            </Text>
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
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    padding: 16,
  },
  profileCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    ...commonStyles.shadow,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...commonStyles.shadow,
  },
  addressCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...commonStyles.shadow,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoValue: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
    ...commonStyles.shadow,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    marginTop: 20,
  },
  errorText: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
  },
});
