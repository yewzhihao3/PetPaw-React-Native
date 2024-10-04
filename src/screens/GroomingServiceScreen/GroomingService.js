import React, { useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ServiceCarousel from "./ServiceCarousel";

const GroomingService = ({ navigation }) => {
  const insets = useSafeAreaInsets();
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

  const services = [
    { id: "1", name: "Bath", price: "RM 120", icon: "water-outline" },
    { id: "2", name: "Haircut", price: "RM 180", icon: "cut-outline" },
    {
      id: "3",
      name: "Nail Trimming",
      price: "RM 60",
      icon: "finger-print-outline",
    },
    { id: "4", name: "Teeth Cleaning", price: "RM 100", icon: "brush-outline" },
    { id: "5", name: "Ear Cleaning", price: "RM 80", icon: "ear-outline" },
  ];

  const bookingHistory = [
    { id: "1", pet: "Fluffy", date: "2023-05-01", status: "Completed" },
    { id: "2", pet: "Max", date: "2023-05-15", status: "Upcoming" },
    { id: "3", pet: "Buddy", date: "2023-04-20", status: "Cancelled" },
    { id: "4", pet: "Luna", date: "2023-05-10", status: "In Progress" },
    { id: "5", pet: "Charlie", date: "2023-05-18", status: "Confirmed" },
  ];

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingItem}>
      <View>
        <Text style={styles.bookingPet}>{item.pet}</Text>
        <Text style={styles.bookingDate}>{item.date}</Text>
      </View>
      <View style={[styles.statusIndicator, getStatusStyle(item.status)]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case "Completed":
        return styles.statusCompleted;
      case "Upcoming":
        return styles.statusUpcoming;
      case "Cancelled":
        return styles.statusCancelled;
      case "In Progress":
        return styles.statusInProgress;
      case "Confirmed":
        return styles.statusConfirmed;
      default:
        return {};
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pet Grooming Service</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Our Services</Text>
        <ServiceCarousel services={services} />
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate("BookingFlowScreen")}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Booking History</Text>
        <FlatList
          data={bookingHistory}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  bookButton: {
    backgroundColor: "#8A2BE2",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignSelf: "center",
    marginVertical: 24,
  },
  bookButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  bookingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 12,
  },
  bookingPet: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  bookingDate: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusCompleted: {
    backgroundColor: "#e6f7ed",
  },
  statusUpcoming: {
    backgroundColor: "#e6f0ff",
  },
  statusCancelled: {
    backgroundColor: "#ffe6e6",
  },
  statusInProgress: {
    backgroundColor: "#fff0e6",
  },
  statusConfirmed: {
    backgroundColor: "#e6ffe6",
  },
});

export default GroomingService;
