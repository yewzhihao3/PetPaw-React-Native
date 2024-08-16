import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../../theme/Themecontext";
import { themeColors } from "../../../theme";
import {
  createUserAddress,
  geocodeAddress,
} from "../../screens/API/apiService";

export default function AddAddressScreen() {
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const { isDarkMode } = useTheme();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const userId = await AsyncStorage.getItem("userId");

      if (!token || !userId) {
        throw new Error("No token or user ID found");
      }

      const fullAddress = `${addressLine1}, ${
        addressLine2 ? addressLine2 + ", " : ""
      }${city}, ${state}, ${country}, ${postalCode}`;
      const geocodeResult = await geocodeAddress(fullAddress);

      if (!geocodeResult) {
        throw new Error("Failed to geocode address");
      }

      const addressData = {
        address_line1: addressLine1,
        address_line2: addressLine2,
        city,
        state,
        country,
        postal_code: postalCode,
        latitude: geocodeResult.lat,
        longitude: geocodeResult.lng,
      };

      const createdAddress = await createUserAddress(
        userId,
        addressData,
        token
      );
      console.log("Address created:", createdAddress);

      // Save the newly created address ID
      await AsyncStorage.setItem(
        "deliveryAddressId",
        createdAddress.id.toString()
      );

      Alert.alert("Success", "Address added successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Error adding address:", error);
      Alert.alert("Error", "Failed to add address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, isDarkMode && styles.darkContainer]}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          Add New Address
        </Text>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="Address Line 1"
          placeholderTextColor={isDarkMode ? "#888" : "#666"}
          value={addressLine1}
          onChangeText={setAddressLine1}
        />
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="Address Line 2 (Optional)"
          placeholderTextColor={isDarkMode ? "#888" : "#666"}
          value={addressLine2}
          onChangeText={setAddressLine2}
        />
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="City"
          placeholderTextColor={isDarkMode ? "#888" : "#666"}
          value={city}
          onChangeText={setCity}
        />
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="State"
          placeholderTextColor={isDarkMode ? "#888" : "#666"}
          value={state}
          onChangeText={setState}
        />
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="Country"
          placeholderTextColor={isDarkMode ? "#888" : "#666"}
          value={country}
          onChangeText={setCountry}
        />
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="Postal Code"
          placeholderTextColor={isDarkMode ? "#888" : "#666"}
          value={postalCode}
          onChangeText={setPostalCode}
        />
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: themeColors.bgColor(0.9) },
            loading && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Adding Address..." : "Add Address"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  darkContainer: {
    backgroundColor: "#1E1E1E",
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  darkText: {
    color: "white",
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 12,
    paddingHorizontal: 10,
    color: "#333",
  },
  darkInput: {
    borderColor: "#444",
    color: "white",
    backgroundColor: "#333",
  },
  button: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.7,
  },
});
