import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ServiceCarousel from "./ServiceCarousel";
import AnimatedDidYouKnow from "./PetCareInfo";
import BookingHistory from "./Booking_History";
import Grooming_apiService from "./Grooming_apiService";

const GroomingService = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [services, setServices] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

    fetchGroomingServices();
    fetchBookingHistory();
  }, []);

  const fetchGroomingServices = async () => {
    try {
      const servicesData = await Grooming_apiService.getGroomingServices();
      setServices(servicesData);
    } catch (error) {
      console.error("Error fetching grooming services:", error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  const fetchBookingHistory = async () => {
    setIsLoading(true);
    try {
      const historyData = await Grooming_apiService.getBookingHistory();
      console.log("Fetched booking history:", historyData);
      setBookingHistory(historyData);
    } catch (error) {
      console.error("Error fetching booking history:", error);
      // Handle error (e.g., show an error message to the user)
      setBookingHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchGroomingServices(), fetchBookingHistory()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setRefreshing(false);
    }
  }, []);

  const renderItem = ({ item }) => {
    if (item.type === "did-you-know") {
      return <AnimatedDidYouKnow />;
    } else if (item.type === "services") {
      return (
        <>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <ServiceCarousel services={services} />
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => navigation.navigate("BookingFlowScreen")}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        </>
      );
    } else if (item.type === "booking-history") {
      return (
        <>
          <Text style={styles.sectionTitle}>Booking History</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#8A2BE2" />
          ) : (
            <BookingHistory bookings={bookingHistory} />
          )}
        </>
      );
    }
    return null;
  };

  const data = [
    { type: "did-you-know", id: "dyk" },
    { type: "services", id: "services" },
    { type: "booking-history", id: "history" },
  ];

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pet Grooming Service</Text>
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#8A2BE2"]} // Android
            tintColor="#8A2BE2" // iOS
          />
        }
      />
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
});

export default GroomingService;
