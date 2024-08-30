import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  TextInput,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

const MapPicker = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [dropoffAddress, setDropoffAddress] = useState("");
  const navigation = useNavigation();
  const mapRef = useRef(null);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  const handleMapPress = (event) => {
    setSelectedLocation(event.nativeEvent.coordinate);
  };

  const handleConfirm = async () => {
    if (selectedLocation) {
      try {
        let result = await Location.reverseGeocodeAsync(selectedLocation);
        if (result.length > 0) {
          const address = result[0];
          const formattedAddress = [
            address.street,
            address.city,
            address.region,
            address.country,
            address.postalCode,
          ]
            .filter(Boolean)
            .join(", ");

          navigation.navigate("PetTaxiPlaceOrder", {
            selectedLocation: {
              address: formattedAddress,
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            },
          });
        }
      } catch (error) {
        console.error("Error getting address:", error);
        Alert.alert("Error", "Failed to get address for selected location");
      }
    }
  };

  const handleDropoffSearch = async () => {
    try {
      const result = await Location.geocodeAsync(dropoffAddress);
      if (result.length > 0) {
        const { latitude, longitude } = result[0];
        setSelectedLocation({ latitude, longitude });
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
      } else {
        Alert.alert("Location not found", "Please enter a valid address");
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      Alert.alert("Error", "Failed to find the entered location");
    }
  };

  return (
    <View style={styles.container}>
      {userLocation && (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={userLocation}
          onPress={handleMapPress}
        >
          <Marker
            coordinate={userLocation}
            pinColor="blue"
            title="Your Location"
          />
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              pinColor="red"
              title="Selected Location"
            />
          )}
        </MapView>
      )}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter dropoff location"
          value={dropoffAddress}
          onChangeText={setDropoffAddress}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleDropoffSearch}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[
          styles.confirmButton,
          !selectedLocation && styles.disabledButton,
        ]}
        onPress={handleConfirm}
        disabled={!selectedLocation}
      >
        <Text style={styles.confirmButtonText}>
          {selectedLocation ? "Confirm Location" : "Select a Location"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#5E17EB",
    borderRadius: 20,
    padding: 10,
  },
  inputContainer: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    flexDirection: "row",
  },
  input: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: "#5E17EB",
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: "center",
  },
  searchButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  confirmButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#7C3AED",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#D1D5DB",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default MapPicker;
