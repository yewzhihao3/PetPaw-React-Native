import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActionSheetIOS,
  Modal,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { createPetTaxiRide } from "./PetTxiapiService";
import PetTaxiOrderConfirmModal from "./PetTaxiOrderConfirmModal";

const PET_TYPES = ["Cat", "Dog", "Birds", "Others"];

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function calculateFare(distance, petType) {
  const baseFare = 5;
  const ratePerKm = 1.5;
  let petFactor = 1;

  switch (petType) {
    case "Dog":
      petFactor = 1.2;
      break;
    case "Cat":
      petFactor = 1.1;
      break;
    case "Birds":
      petFactor = 1.3;
      break;
    default:
      petFactor = 1.5;
  }

  const fare = (baseFare + distance * ratePerKm) * petFactor;
  return Math.round(fare * 100) / 100;
}

const PetTaxiPlaceOrder = () => {
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [petType, setPetType] = useState("");
  const [otherPetType, setOtherPetType] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(false);
  const [showPetTypeModal, setShowPetTypeModal] = useState(false);
  const [estimatedFare, setEstimatedFare] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    if (route.params?.selectedLocation) {
      setDropoffLocation(route.params.selectedLocation.address);
    }
  }, [route.params?.selectedLocation]);

  useEffect(() => {
    updateEstimatedFare();
  }, [pickupLocation, dropoffLocation, petType, otherPetType]);

  const updateEstimatedFare = async () => {
    if (pickupLocation && dropoffLocation && petType) {
      try {
        const pickupCoords = isUsingCurrentLocation
          ? await getCurrentLocation()
          : await Location.geocodeAsync(pickupLocation);
        const dropoffCoords =
          route.params?.selectedLocation ||
          (await Location.geocodeAsync(dropoffLocation));

        const distance = calculateDistance(
          pickupCoords[0].latitude,
          pickupCoords[0].longitude,
          dropoffCoords.latitude,
          dropoffCoords.longitude
        );

        const fare = calculateFare(
          distance,
          petType === "Others" ? otherPetType : petType
        );
        setEstimatedFare(fare);
      } catch (error) {
        console.error("Error calculating estimated fare:", error);
      }
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const pickupCoords = isUsingCurrentLocation
        ? await getCurrentLocation()
        : await Location.geocodeAsync(pickupLocation);
      const dropoffCoords =
        route.params?.selectedLocation ||
        (await Location.geocodeAsync(dropoffLocation));
      const finalPetType = petType === "Others" ? otherPetType : petType;
      const distance = calculateDistance(
        pickupCoords[0].latitude,
        pickupCoords[0].longitude,
        dropoffCoords.latitude,
        dropoffCoords.longitude
      );
      const fare = calculateFare(distance, finalPetType);

      const data = {
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation,
        pickup_latitude: pickupCoords[0].latitude,
        pickup_longitude: pickupCoords[0].longitude,
        dropoff_latitude: dropoffCoords.latitude,
        dropoff_longitude: dropoffCoords.longitude,
        pet_type: finalPetType,
        special_instructions: specialInstructions,
        fare: fare,
        distance: distance,
      };
      setOrderData(data);
      setShowConfirmationModal(true);
    } catch (error) {
      console.error("Error preparing order:", error);
      Alert.alert("Error", "Failed to prepare order. Please try again.");
    }
  };

  const confirmOrder = async () => {
    try {
      const response = await createPetTaxiRide(orderData);
      setShowConfirmationModal(false);
      navigation.navigate("PetTaxiOrderConfirmation", { rideId: response.id });
    } catch (error) {
      console.error("Error placing order:", error);
      Alert.alert("Error", "Failed to place order. Please try again.");
    }
  };

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Please enable location services to use this feature."
      );
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setIsUsingCurrentLocation(true);

    try {
      let results = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (results.length > 0) {
        const address = results[0];
        const fullAddress = `${address.street}, ${address.city}, ${address.region}, ${address.country}, ${address.postalCode}`;
        setPickupLocation(fullAddress);
      } else {
        setPickupLocation("Current Location (Address not found)");
      }

      return [
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      ];
    } catch (error) {
      console.error("Error getting address:", error);
      setPickupLocation("Current Location (Error getting address)");
      return [
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      ];
    }
  };

  const openMap = () => {
    navigation.navigate("MapPicker");
  };

  const openPetTypeSelector = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...PET_TYPES, "Cancel"],
          cancelButtonIndex: PET_TYPES.length,
        },
        (buttonIndex) => {
          if (buttonIndex !== PET_TYPES.length) {
            setPetType(PET_TYPES[buttonIndex]);
          }
        }
      );
    } else {
      setShowPetTypeModal(true);
    }
  };

  const renderPetTypeModal = () => (
    <Modal visible={showPetTypeModal} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {PET_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.modalOption}
              onPress={() => {
                setPetType(type);
                setShowPetTypeModal(false);
              }}
            >
              <Text style={styles.modalOptionText}>{type}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.modalOption, styles.cancelOption]}
            onPress={() => setShowPetTypeModal(false)}
          >
            <Text style={[styles.modalOptionText, styles.cancelText]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#5B21B6" />
          </TouchableOpacity>
          <Text style={styles.title}>Book a Pet Taxi</Text>
          <View style={styles.headerRight} />
        </View>
        <ScrollView>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pickup Location</Text>
            <View style={styles.inputWithButton}>
              <TextInput
                style={[styles.input, styles.inputWithButtonText]}
                value={pickupLocation}
                onChangeText={setPickupLocation}
                placeholder="Enter pickup address"
                placeholderTextColor="#A0AEC0"
                editable={!isUsingCurrentLocation}
              />
              <TouchableOpacity
                style={styles.locationButton}
                onPress={getCurrentLocation}
              >
                <Ionicons name="location" size={24} color="#5B21B6" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Dropoff Location</Text>
            <View style={styles.inputWithButton}>
              <TextInput
                style={[styles.input, styles.inputWithButtonText]}
                value={dropoffLocation}
                onChangeText={setDropoffLocation}
                placeholder="Enter dropoff address"
                placeholderTextColor="#A0AEC0"
              />
              <TouchableOpacity style={styles.locationButton} onPress={openMap}>
                <Ionicons name="map" size={24} color="#5B21B6" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pet Type</Text>
            <TouchableOpacity
              style={styles.petTypeButton}
              onPress={openPetTypeSelector}
            >
              <Text style={styles.petTypeButtonText}>
                {petType || "Select Pet Type"}
              </Text>
              <Ionicons name="chevron-down" size={24} color="#5B21B6" />
            </TouchableOpacity>
          </View>
          {petType === "Others" && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Other Pet Type</Text>
              <TextInput
                style={styles.input}
                value={otherPetType}
                onChangeText={setOtherPetType}
                placeholder="Enter pet type"
                placeholderTextColor="#A0AEC0"
              />
            </View>
          )}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Special Instructions</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              placeholder="Any special instructions for the driver"
              placeholderTextColor="#A0AEC0"
              multiline
            />
          </View>
          {estimatedFare !== null && (
            <View style={styles.fareContainer}>
              <Text style={styles.fareText}>
                Estimated Fare: RM{estimatedFare.toFixed(2)}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.placeOrderButton}
            onPress={handlePlaceOrder}
          >
            <Text style={styles.buttonText}>Place Order</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      {renderPetTypeModal()}
      <PetTaxiOrderConfirmModal
        visible={showConfirmationModal}
        orderData={orderData}
        onConfirm={confirmOrder}
        onCancel={() => setShowConfirmationModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FF",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5B21B6",
  },
  headerRight: {
    width: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4B5563",
    marginBottom: 5,
  },
  inputWithButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: "#4A5568",
  },
  inputWithButtonText: {
    flex: 1,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  locationButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderLeftWidth: 0,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  placeOrderButton: {
    backgroundColor: "#7C3AED",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  petTypeButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 15,
  },
  petTypeButtonText: {
    fontSize: 16,
    color: "#4A5568",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  modalOption: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalOptionText: {
    fontSize: 18,
    color: "#4A5568",
  },
  cancelOption: {
    borderBottomWidth: 0,
  },
  cancelText: {
    color: "red",
  },
  fareContainer: {
    backgroundColor: "#EDE9FE",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  fareText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5B21B6",
    textAlign: "center",
  },
});

export default PetTaxiPlaceOrder;
