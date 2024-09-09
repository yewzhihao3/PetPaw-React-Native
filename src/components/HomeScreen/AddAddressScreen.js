import React, { useState, useEffect } from "react";
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
import { getTheme } from "../../../theme/HomeTheme";
import {
  createUserAddress,
  geocodeAddress,
} from "../../screens//HomeScreen/HomeapiService";
import RNPickerSelect from "react-native-picker-select";
import { Ionicons } from "@expo/vector-icons";
import { countries, states, cities } from "./MockData";

export default function AddAddressScreen() {
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);

  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  useEffect(() => {
    if (country) {
      setStateOptions(states[country] || []);
      setState("");
      setCity("");
    }
  }, [country]);

  useEffect(() => {
    if (state) {
      setCityOptions(cities[state] || []);
      setCity("");
    }
  }, [state]);

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

  const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      color: theme.text,
      paddingRight: 30,
      backgroundColor: theme.cardBackground,
    },
    inputAndroid: {
      fontSize: 16,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      color: theme.text,
      paddingRight: 30,
      backgroundColor: theme.cardBackground,
    },
    iconContainer: {
      top: "20%",
      right: 5,
    },
  });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>
          Add New Address
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>
            Address Line 1
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.cardBackground,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="Enter address line 1"
            placeholderTextColor={theme.textSecondary}
            value={addressLine1}
            onChangeText={setAddressLine1}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>
            Address Line 2 (Optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.cardBackground,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="Enter address line 2"
            placeholderTextColor={theme.textSecondary}
            value={addressLine2}
            onChangeText={setAddressLine2}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>Country</Text>
          <RNPickerSelect
            onValueChange={(value) => setCountry(value)}
            items={countries}
            style={pickerSelectStyles}
            value={country}
            placeholder={{ label: "Select a country", value: null }}
            useNativeAndroidPickerStyle={false}
            Icon={() => (
              <View style={pickerSelectStyles.iconContainer}>
                <Ionicons name="chevron-down" size={24} color={theme.text} />
              </View>
            )}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>State</Text>
          <RNPickerSelect
            onValueChange={(value) => setState(value)}
            items={stateOptions}
            style={pickerSelectStyles}
            value={state}
            placeholder={{ label: "Select a state", value: null }}
            useNativeAndroidPickerStyle={false}
            Icon={() => (
              <View style={pickerSelectStyles.iconContainer}>
                <Ionicons name="chevron-down" size={24} color={theme.text} />
              </View>
            )}
            disabled={!country}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>City</Text>
          <RNPickerSelect
            onValueChange={(value) => setCity(value)}
            items={cityOptions}
            style={pickerSelectStyles}
            value={city}
            placeholder={{ label: "Select a city", value: null }}
            useNativeAndroidPickerStyle={false}
            Icon={() => (
              <View style={pickerSelectStyles.iconContainer}>
                <Ionicons name="chevron-down" size={24} color={theme.text} />
              </View>
            )}
            disabled={!state}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>Postal Code</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.cardBackground,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="Enter postal code"
            placeholderTextColor={theme.textSecondary}
            value={postalCode}
            onChangeText={setPostalCode}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#6d28d9",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.7,
  },
});
