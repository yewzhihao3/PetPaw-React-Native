import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Grooming_apiService from "./Grooming_apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BookingConfirmation = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { pet, services, date, time, totalPrice } = route.params;
  const [isLoading, setIsLoading] = useState(false);

  const parsedDate = new Date(date);

  // Calculate end time
  const startTime = new Date(`2000-01-01T${time.startTime}`);
  const endTime = new Date(startTime.getTime() + time.duration * 60000);
  const formattedStartTime = startTime.toTimeString().slice(0, 5);
  const formattedEndTime = endTime.toTimeString().slice(0, 5);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDone = async () => {
    setIsLoading(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      const bookingData = {
        pet_id: pet.id,
        user_id: parseInt(userId, 10), // Ensure it's a number
        date: parsedDate.toISOString().split("T")[0], // Send only the date part
        start_time: time.startTime,
        service_ids: services.map((service) => service.id),
      };
      console.log("Sending booking data:", bookingData); // For debugging
      await Grooming_apiService.createBooking(bookingData);
      navigation.navigate("GroomingService");
    } catch (error) {
      console.error(
        "Error creating booking:",
        error.response?.data || error.message
      );
      // Handle error (e.g., show an alert to the user)
    } finally {
      setIsLoading(false);
    }
  };

  const renderServiceItem = ({ item }) => {
    return (
      <View style={styles.serviceItem}>
        <View style={styles.serviceInfoContainer}>
          <Ionicons
            name={item.icon}
            size={20}
            color="#8A2BE2"
            style={styles.serviceIcon}
          />
          <Text style={styles.serviceText}>{item.name}</Text>
        </View>
        <Text style={styles.servicePriceText}>RM {item.price}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Booking Confirmed</Text>
      </View>
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#8A2BE2" />
        </View>
        <Text style={styles.confirmationText}>
          Your grooming session is booked!
        </Text>
        <View style={styles.detailsContainer}>
          <DetailItem
            icon="paw"
            label="Pet"
            value={`${pet.name} (${pet.species})`}
          />
          <View style={styles.servicesContainer}>
            <Text style={styles.detailLabel}>Services</Text>
            <FlatList
              data={services}
              renderItem={renderServiceItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.servicesList}
            />
          </View>
          <DetailItem
            icon="calendar"
            label="Date"
            value={parsedDate.toDateString()}
          />
          <DetailItem
            icon="time"
            label="Time"
            value={`${formattedStartTime} - ${formattedEndTime}`}
          />
          <DetailItem
            icon="cash"
            label="Total Price"
            value={`RM ${totalPrice.toFixed(2)}`}
          />
        </View>
      </Animated.View>
      <TouchableOpacity
        style={styles.doneButton}
        onPress={handleDone}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.doneButtonText}>Done</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const DetailItem = ({ icon, label, value }) => (
  <View style={styles.detailItem}>
    <Ionicons name={icon} size={24} color="#8A2BE2" style={styles.detailIcon} />
    <View>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    backgroundColor: "#8A2BE2",
    padding: 16,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    margin: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  confirmationText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 24,
  },
  detailsContainer: {
    marginTop: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  detailIcon: {
    marginRight: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  servicesContainer: {
    marginBottom: 16,
  },
  servicesList: {
    marginLeft: 40,
  },
  serviceInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceIcon: {
    marginRight: 8,
    width: 24,
    textAlign: "center",
  },
  serviceText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  servicePriceText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  doneButton: {
    backgroundColor: "#8A2BE2",
    padding: 16,
    borderRadius: 8,
    margin: 20,
    alignItems: "center",
  },
  doneButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default BookingConfirmation;
