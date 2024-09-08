import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getUserPets, getServices, createAppointment } from "../API/apiService";
import { format } from "date-fns";

const BookAppointment = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [dateTime, setDateTime] = useState(null);
  const [notes, setNotes] = useState("");
  const [otherPetSpecies, setOtherPetSpecies] = useState("");
  const [otherPetBreed, setOtherPetBreed] = useState("");

  useEffect(() => {
    fetchPets();
    fetchServices();
  }, []);

  useEffect(() => {
    if (route.params?.selectedPetId) {
      setSelectedPet(route.params.selectedPetId);
    }
    if (route.params?.selectedServiceId) {
      setSelectedService(route.params.selectedServiceId);
    }
    if (route.params?.selectedDateTime) {
      const selectedDate = new Date(route.params.selectedDateTime);
      setDateTime(selectedDate);

      console.log("Date and Time picked from DateTimePicker:");
      console.log("Local:", selectedDate.toLocaleString());
      console.log("ISO Local:", selectedDate.toISOString());

      // Calculate UTC time
      const utcDate = new Date(
        Date.UTC(
          selectedDate.getUTCFullYear(),
          selectedDate.getUTCMonth(),
          selectedDate.getUTCDate(),
          selectedDate.getUTCHours(),
          selectedDate.getUTCMinutes(),
          selectedDate.getUTCSeconds()
        )
      );
      console.log("UTC:", utcDate.toUTCString());
      console.log("ISO UTC:", utcDate.toISOString());
    }
  }, [route.params]);

  const fetchPets = async () => {
    try {
      const userPets = await getUserPets();
      setPets([...userPets, { id: "other", name: "Others" }]);
    } catch (error) {
      console.error("Error fetching pets:", error);
      Alert.alert("Error", "Failed to fetch pets. Please try again.");
    }
  };

  const fetchServices = async () => {
    try {
      const fetchedServices = await getServices();
      setServices([...fetchedServices, { id: "other", name: "Others" }]);
    } catch (error) {
      console.error("Error fetching services:", error);
      Alert.alert("Error", "Failed to fetch services. Please try again.");
    }
  };

  const handleDateTimePicker = () => {
    navigation.navigate("DateTimePicker");
  };

  const renderOtherPetFields = () => {
    if (selectedPet === "other") {
      return (
        <>
          <Text style={styles.label}>Species</Text>
          <TextInput
            style={styles.input}
            value={otherPetSpecies}
            onChangeText={setOtherPetSpecies}
            placeholder="Enter pet species"
          />
          <Text style={styles.label}>Breed</Text>
          <TextInput
            style={styles.input}
            value={otherPetBreed}
            onChangeText={setOtherPetBreed}
            placeholder="Enter pet breed"
          />
        </>
      );
    }
    return null;
  };

  const handleBookAppointment = useCallback(async () => {
    if (!selectedPet || !selectedService || !dateTime) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    try {
      // Convert to UTC and format as required by the server
      const formattedDateTime = dateTime.toUTCString();

      const appointmentData = {
        pet_id: selectedPet === "other" ? null : parseInt(selectedPet),
        other_pet_species: selectedPet === "other" ? otherPetSpecies : null,
        other_pet_breed: selectedPet === "other" ? otherPetBreed : null,
        service_id: parseInt(selectedService),
        date_time: formattedDateTime,
        notes: notes || null,
      };

      console.log("Appointment data:", appointmentData);

      const response = await createAppointment(appointmentData);

      console.log("Appointment booked:", response);

      Alert.alert("Success", "Appointment booked successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error booking appointment:", error);
      let errorMessage = "Failed to book appointment. Please try again.";
      if (error.response && error.response.data) {
        errorMessage += ` Server says: ${JSON.stringify(error.response.data)}`;
      }
      Alert.alert("Error", errorMessage);
    }
  }, [
    selectedPet,
    selectedService,
    dateTime,
    notes,
    otherPetSpecies,
    otherPetBreed,
    navigation,
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.form}>
        <Text style={styles.label}>Select Pet</Text>
        <RNPickerSelect
          onValueChange={(value) => setSelectedPet(value)}
          items={pets.map((pet) => ({ label: pet.name, value: pet.id }))}
          style={pickerSelectStyles}
          placeholder={{ label: "Select a pet", value: null }}
          value={selectedPet}
        />
        {renderOtherPetFields()}

        <Text style={styles.label}>Select Service</Text>
        <RNPickerSelect
          onValueChange={(value) => setSelectedService(value)}
          items={services.map((service) => ({
            label: service.name,
            value: service.id,
          }))}
          style={pickerSelectStyles}
          placeholder={{ label: "Select a service", value: null }}
          value={selectedService}
        />

        <Text style={styles.label}>Date and Time</Text>
        {dateTime ? (
          <View style={styles.dateTimeContainer}>
            <Text style={styles.dateTimeText}>{format(dateTime, "PPpp")}</Text>
            <TouchableOpacity onPress={() => setDateTime(null)}>
              <Ionicons name="close-circle" size={24} color="#6d28d9" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={handleDateTimePicker}
          >
            <Text style={styles.dateTimeButtonText}>Select Date and Time</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.label}>Notes (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          multiline
          numberOfLines={4}
          onChangeText={setNotes}
          value={notes}
          placeholder="Add any additional notes here"
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleBookAppointment}
        >
          <Text style={styles.submitButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#6d28d9",
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#4B5563",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  dateTimeButton: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#6d28d9",
    alignItems: "center",
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: "#6d28d9",
    fontWeight: "bold",
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#6d28d9",
  },
  dateTimeText: {
    fontSize: 16,
    color: "#4B5563",
  },
  notesInput: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    height: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#6d28d9",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    color: "#4B5563",
    paddingRight: 30,
    backgroundColor: "white",
    marginBottom: 20,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    color: "#4B5563",
    paddingRight: 30,
    backgroundColor: "white",
    marginBottom: 20,
  },
});

export default BookAppointment;
