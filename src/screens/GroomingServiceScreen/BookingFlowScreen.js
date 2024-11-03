import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import CustomCalendar from "./CustomCalendar";
import TimeSlotSelection from "./TimeSlotSelection";
import Grooming_apiService from "./Grooming_apiService";

const BookingFlowScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  const serviceOpacity = useRef(new Animated.Value(0)).current;
  const dateOpacity = useRef(new Animated.Value(0)).current;
  const timeOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchUserPets();
    fetchGroomingServices();
  }, []);

  const fetchUserPets = async () => {
    try {
      const userPets = await Grooming_apiService.getUserPets();
      setPets(userPets);
    } catch (error) {
      console.error("Error fetching user pets:", error);
      Alert.alert("Error", "Failed to fetch your pets. Please try again.");
    }
  };

  const fetchGroomingServices = async () => {
    try {
      const servicesData = await Grooming_apiService.getGroomingServices();
      setServices(servicesData);
    } catch (error) {
      console.error("Error fetching grooming services:", error);
      Alert.alert(
        "Error",
        "Failed to fetch grooming services. Please try again."
      );
    }
  };

  const fetchAvailableTimeSlots = async (date) => {
    try {
      const slots = await Grooming_apiService.getAvailableTimeSlots(date);
      setAvailableTimeSlots(slots);
    } catch (error) {
      console.error("Error fetching available time slots:", error);
      Alert.alert(
        "Error",
        "Failed to fetch available time slots. Please try again."
      );
    }
  };

  const animateNextSection = (animatedValue) => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const calculateRoundedDuration = (selectedServices) => {
    const totalMinutes = selectedServices.reduce((total, id) => {
      const service = services.find((s) => s.id === id);
      return total + (service ? service.duration : 0);
    }, 0);

    // Round up to the nearest hour
    return Math.ceil(totalMinutes / 60) * 60;
  };

  const renderPetSelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Your Pet</Text>
      <View style={styles.petContainer}>
        {pets.map((pet) => (
          <TouchableOpacity
            key={pet.id}
            style={[
              styles.petItem,
              selectedPet?.id === pet.id && styles.selectedPetItem,
            ]}
            onPress={() => {
              setSelectedPet(pet);
              animateNextSection(serviceOpacity);
            }}
          >
            <Text
              style={[
                styles.petItemText,
                selectedPet?.id === pet.id && styles.selectedPetItemText,
              ]}
            >
              {pet.name}
            </Text>
            <Text
              style={[
                styles.petTypeText,
                selectedPet?.id === pet.id && styles.selectedPetItemText,
              ]}
            >
              {pet.type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderServiceSelection = () => (
    <Animated.View style={[styles.section, { opacity: serviceOpacity }]}>
      <Text style={styles.sectionTitle}>Select Services</Text>
      <View style={styles.serviceContainer}>
        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.serviceItem,
              selectedServices.includes(service.id) &&
                styles.selectedServiceItem,
            ]}
            onPress={() => {
              setSelectedServices((prev) =>
                prev.includes(service.id)
                  ? prev.filter((id) => id !== service.id)
                  : [...prev, service.id]
              );
              if (!selectedDate) animateNextSection(dateOpacity);
            }}
          >
            <Ionicons
              name={service.icon}
              size={24}
              color={
                selectedServices.includes(service.id) ? "white" : "#8A2BE2"
              }
            />
            <Text
              style={[
                styles.serviceItemText,
                selectedServices.includes(service.id) &&
                  styles.selectedServiceItemText,
              ]}
            >
              {service.name}
            </Text>
            <Text
              style={[
                styles.servicePriceText,
                selectedServices.includes(service.id) &&
                  styles.selectedServiceItemText,
              ]}
            >
              RM {service.price}
            </Text>
            <Text
              style={[
                styles.serviceDurationText,
                selectedServices.includes(service.id) &&
                  styles.selectedServiceItemText,
              ]}
            >
              {service.duration} min
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderDateSelection = () => (
    <Animated.View style={[styles.section, { opacity: dateOpacity }]}>
      <Text style={styles.sectionTitle}>Select Date</Text>
      <CustomCalendar
        onSelectDate={(date) => {
          setSelectedDate(date);
          fetchAvailableTimeSlots(date.toISOString().split("T")[0]);
          animateNextSection(timeOpacity);
        }}
        disabledDates={[]}
      />
    </Animated.View>
  );

  const renderTimeSelection = () => (
    <Animated.View style={[styles.section, { opacity: timeOpacity }]}>
      <Text style={styles.sectionTitle}>Select Time</Text>
      <TimeSlotSelection
        availableSlots={availableTimeSlots}
        selectedSlot={selectedTime}
        onSelectSlot={(slot) => setSelectedTime(slot)}
        duration={calculateRoundedDuration(selectedServices)}
      />
    </Animated.View>
  );

  const handleConfirmBooking = () => {
    Alert.alert(
      "Confirm Booking",
      "Are you sure you want to confirm this booking?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => {
            const selectedServiceObjects = selectedServices.map((id) =>
              services.find((s) => s.id === id)
            );
            const totalDuration = calculateRoundedDuration(selectedServices);
            const totalPrice = selectedServiceObjects.reduce(
              (sum, service) => sum + service.price,
              0
            );

            navigation.navigate("BookingConfirmation", {
              pet: selectedPet,
              services: selectedServiceObjects,
              date: selectedDate.toISOString(),
              time: {
                startTime: selectedTime.startTime,
                duration: totalDuration,
              },
              totalPrice: totalPrice,
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book a Grooming Session</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {renderPetSelection()}
        {selectedPet && renderServiceSelection()}
        {selectedServices.length > 0 && renderDateSelection()}
        {selectedDate && renderTimeSelection()}
      </ScrollView>
      {selectedPet &&
        selectedServices.length > 0 &&
        selectedDate &&
        selectedTime && (
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmBooking}
          >
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
          </TouchableOpacity>
        )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#8A2BE2",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  petContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  petItem: {
    width: "48%",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#8A2BE2",
    alignItems: "center",
    marginBottom: 10,
  },
  selectedPetItem: {
    backgroundColor: "#8A2BE2",
  },
  petItemText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8A2BE2",
  },
  selectedPetItemText: {
    color: "white",
  },
  petTypeText: {
    fontSize: 12,
    color: "#666",
  },
  serviceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  serviceItem: {
    width: "48%",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#8A2BE2",
    marginBottom: 8,
    alignItems: "center",
  },
  selectedServiceItem: {
    backgroundColor: "#8A2BE2",
  },
  serviceItemText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#8A2BE2",
    marginTop: 4,
  },
  servicePriceText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  serviceDurationText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  selectedServiceItemText: {
    color: "white",
  },
  confirmButton: {
    backgroundColor: "#8A2BE2",
    padding: 16,
    borderRadius: 8,
    margin: 20,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default BookingFlowScreen;
