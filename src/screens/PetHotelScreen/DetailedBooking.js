import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Collapsible from "react-native-collapsible";
import { createBooking } from "./Pet_Hotel_apiService";
import { getUserPets } from "../PetScreen/PapiService";

const petSizes = ["SMALL", "MEDIUM", "LARGE"];

const DetailedBooking = ({ route, navigation }) => {
  const { hotel, startDate, endDate } = route.params;
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [dietaryNeeds, setDietaryNeeds] = useState("");
  const [medicationNeeds, setMedicationNeeds] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  const [isPetDropdownVisible, setIsPetDropdownVisible] = useState(false);
  const [isSizeDropdownVisible, setIsSizeDropdownVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pets, setPets] = useState([]);

  useEffect(() => {
    fetchUserPets();
  }, []);

  const fetchUserPets = async () => {
    try {
      const userPets = await getUserPets();
      setPets(userPets);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching user pets:", error);
      Alert.alert("Error", "Unable to fetch your pets. Please try again.");
      setIsLoading(false);
    }
  };

  const handleBooking = () => {
    if (!selectedPet || !selectedSize || !emergencyContact) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }
    setIsModalVisible(true);
  };

  const confirmBooking = async () => {
    setIsModalVisible(false);
    setIsLoading(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found");
      }
      const bookingData = {
        user_id: parseInt(userId),
        pet_id: selectedPet.id,
        hotel_id: hotel.id,
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        pet_size: selectedSize,
        special_requests: specialRequests || null,
        dietary_needs: dietaryNeeds || null,
        medication_needs: medicationNeeds || null,
        emergency_contact: emergencyContact,
      };
      const response = await createBooking(bookingData);
      setIsLoading(false);
      navigation.navigate("BookingConfirmed", {
        booking: response,
        hotel: hotel,
        pet: selectedPet,
        petSize: selectedSize,
        startDate: startDate,
        endDate: endDate,
        specialRequests: specialRequests,
        dietaryNeeds: dietaryNeeds,
        medicationNeeds: medicationNeeds,
        emergencyContact: emergencyContact,
      });
    } catch (error) {
      setIsLoading(false);
      console.error("Error creating booking:", error);
      Alert.alert(
        "Booking Failed",
        "There was an error creating your booking. Please try again."
      );
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0]; // Returns date in YYYY-MM-DD format
  };

  const renderSection = (title, content, icon) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {content}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B46C1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>{hotel.name}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {renderSection(
          "Booking Details",
          <View>
            <Text style={styles.infoText}>Check-in: {startDate}</Text>
            <Text style={styles.infoText}>Check-out: {endDate}</Text>
          </View>,
          <Ionicons name="calendar" size={24} color="#6B46C1" />
        )}

        {renderSection(
          "Pet Information",
          <View>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setIsPetDropdownVisible(!isPetDropdownVisible)}
            >
              <Text style={styles.dropdownText}>
                {selectedPet ? selectedPet.name : "Select your pet"}
              </Text>
              <Ionicons
                name={isPetDropdownVisible ? "chevron-up" : "chevron-down"}
                size={24}
                color="#6B46C1"
              />
            </TouchableOpacity>
            <Collapsible collapsed={!isPetDropdownVisible}>
              {pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedPet(pet);
                    setIsPetDropdownVisible(false);
                  }}
                >
                  <Text>
                    {pet.name} ({pet.species})
                  </Text>
                </TouchableOpacity>
              ))}
            </Collapsible>

            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setIsSizeDropdownVisible(!isSizeDropdownVisible)}
            >
              <Text style={styles.dropdownText}>
                {selectedSize || "Select pet size"}
              </Text>
              <Ionicons
                name={isSizeDropdownVisible ? "chevron-up" : "chevron-down"}
                size={24}
                color="#6B46C1"
              />
            </TouchableOpacity>
            <Collapsible collapsed={!isSizeDropdownVisible}>
              {petSizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedSize(size);
                    setIsSizeDropdownVisible(false);
                  }}
                >
                  <Text>{size}</Text>
                </TouchableOpacity>
              ))}
            </Collapsible>
          </View>,
          <MaterialCommunityIcons name="paw" size={24} color="#6B46C1" />
        )}

        {renderSection(
          "Special Requirements",
          <View>
            <TextInput
              style={styles.input}
              onChangeText={setDietaryNeeds}
              value={dietaryNeeds}
              placeholder="Dietary needs"
              multiline
            />
            <TextInput
              style={styles.input}
              onChangeText={setMedicationNeeds}
              value={medicationNeeds}
              placeholder="Medication needs"
              multiline
            />
            <TextInput
              style={styles.input}
              onChangeText={setSpecialRequests}
              value={specialRequests}
              placeholder="Any special requests?"
              multiline
            />
          </View>,
          <Ionicons name="list" size={24} color="#6B46C1" />
        )}

        {renderSection(
          "Emergency Contact",
          <TextInput
            style={styles.input}
            onChangeText={setEmergencyContact}
            value={emergencyContact}
            placeholder="Name and phone number"
          />,
          <Ionicons name="call" size={24} color="#6B46C1" />
        )}

        {renderSection(
          "Hotel Features",
          <View>
            {hotel.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={24} color="#6B46C1" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>,
          <Ionicons name="star" size={24} color="#6B46C1" />
        )}

        <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
          <Text style={styles.bookButtonText}>Confirm Booking</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Booking</Text>
            <Text style={styles.modalText}>
              Are you sure you want to confirm this booking?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={confirmBooking}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6B46C1",
    padding: 15,
  },
  backButton: {
    padding: 10,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#F3E8FF",
    borderRadius: 10,
    padding: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A5568",
    marginLeft: 10,
  },
  infoText: {
    fontSize: 16,
    color: "#4A5568",
    marginBottom: 5,
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  dropdownText: {
    fontSize: 16,
    color: "#4A5568",
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: "#2D3748",
    marginBottom: 10,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  featureText: {
    fontSize: 16,
    color: "#4A5568",
    marginLeft: 10,
  },
  bookButton: {
    backgroundColor: "#6B46C1",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6B46C1",
    marginBottom: 15,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
    color: "#4A5568",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButton: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    minWidth: 100,
  },
  modalCancelButton: {
    backgroundColor: "#CBD5E0",
  },
  modalConfirmButton: {
    backgroundColor: "#6B46C1",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default DetailedBooking;
