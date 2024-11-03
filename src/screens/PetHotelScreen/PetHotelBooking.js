import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  Animated,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DatePicker from "./DatePicker";
import { getPetHotels, getUserBookings } from "./Pet_Hotel_apiService";
import BookingHistory from "./BookingHistory";

const rules = [
  { icon: "paw-outline", text: "Pets must be up to date on vaccinations" },
  {
    icon: "fast-food-outline",
    text: "Bring your pet's food and any medications",
  },
  {
    icon: "time-outline",
    text: "Check-in time is 2 PM, Check-out time is 11 AM",
  },
  { icon: "walk-outline", text: "Pets must be leashed in common areas" },
];

const PetHotelBooking = ({ navigation }) => {
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rulesExpanded, setRulesExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const animatedHeight = useState(new Animated.Value(0))[0];
  const hotelCardScale = useState(new Animated.Value(1))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    fetchHotels();
    fetchUserBookings();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const fetchHotels = async () => {
    try {
      const data = await getPetHotels();
      setHotels(data);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setError("Failed to load hotels. Please try again.");
      setLoading(false);
    }
  };

  const fetchUserBookings = async () => {
    try {
      // TODO: Replace with actual user ID
      const userId = 1;
      const data = await getUserBookings(userId);
      setBookings(Array.isArray(data) ? data : []);
      setError(null);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      setError("Failed to load bookings. Please try again.");
      setBookings([]);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchHotels(), fetchUserBookings()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
      setError("Failed to refresh data. Please try again.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleHotelSelect = (hotel) => {
    Animated.sequence([
      Animated.timing(hotelCardScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(hotelCardScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (selectedHotel && selectedHotel.id === hotel.id) {
      setSelectedHotel(null);
      setShowCalendar(false);
      setStartDate(null);
      setEndDate(null);
    } else {
      setSelectedHotel(hotel);
      setShowCalendar(true);
      setStartDate(null);
      setEndDate(null);
    }
  };

  const handleDateSelect = (date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else if (date > startDate) {
      setEndDate(date);
    } else {
      setStartDate(date);
      setEndDate(null);
    }
  };

  const getAvailability = (date) => {
    return Math.floor(Math.random() * 10) + 1;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // This will return 'YYYY-MM-DD'
  };

  const toggleRules = () => {
    setRulesExpanded(!rulesExpanded);
    Animated.timing(animatedHeight, {
      toValue: rulesExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  if (loading) {
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
        <Text style={styles.title}>PetPaw Hotels</Text>
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.content}
        style={{ opacity: fadeAnim }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6B46C1"]} // Android
            tintColor="#6B46C1" // iOS
          />
        }
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Select Hotel Type</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.hotelTypesContainer}
        >
          {hotels.map((hotel) => (
            <Animated.View
              key={hotel.id}
              style={[
                styles.hotelCard,
                selectedHotel?.id === hotel.id && styles.selectedHotelCard,
                { transform: [{ scale: hotelCardScale }] },
              ]}
            >
              <TouchableOpacity onPress={() => handleHotelSelect(hotel)}>
                <Image
                  source={{ uri: hotel.image }}
                  style={styles.hotelImage}
                />
                <Text style={styles.hotelName}>{hotel.name}</Text>
                <Text style={styles.hotelPrice}>RM {hotel.price}/night</Text>
                <Text style={styles.hotelType}>{hotel.type}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>

        {showCalendar && (
          <View style={styles.datePickerContainer}>
            <Text style={styles.sectionTitle}>Select Dates</Text>
            <DatePicker
              onSelectDate={handleDateSelect}
              startDate={startDate}
              endDate={endDate}
            />
            {startDate && endDate && (
              <Text style={styles.availabilityText}>
                {getAvailability(startDate)} spots available for your selected
                dates
              </Text>
            )}
          </View>
        )}

        {selectedHotel && startDate && endDate && (
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() =>
              navigation.navigate("DetailedBooking", {
                hotel: selectedHotel,
                startDate: formatDate(startDate),
                endDate: formatDate(endDate),
              })
            }
          >
            <Text style={styles.bookButtonText}>Continue Booking</Text>
          </TouchableOpacity>
        )}

        <BookingHistory bookings={bookings} />

        <View style={styles.rulesContainer}>
          <TouchableOpacity onPress={toggleRules} style={styles.rulesHeader}>
            <Text style={styles.sectionTitle}>Hotel Rules</Text>
            <Ionicons
              name={rulesExpanded ? "chevron-up" : "chevron-down"}
              size={24}
              color="#6B46C1"
            />
          </TouchableOpacity>
          <Animated.View
            style={[
              styles.rulesContent,
              {
                maxHeight: animatedHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 200],
                }),
                opacity: animatedHeight,
              },
            ]}
          >
            {rules.map((rule, index) => (
              <View key={index} style={styles.ruleItem}>
                <Ionicons
                  name={rule.icon}
                  size={24}
                  color="#6B46C1"
                  style={styles.ruleIcon}
                />
                <Text style={styles.ruleText}>{rule.text}</Text>
              </View>
            ))}
          </Animated.View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6B46C1",
    marginBottom: 15,
  },
  hotelTypesContainer: {
    marginBottom: 20,
  },
  hotelCard: {
    width: 200,
    marginRight: 15,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    padding: 10,
    shadowColor: "#6B46C1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  selectedHotelCard: {
    borderColor: "#6B46C1",
    borderWidth: 2,
  },
  hotelImage: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6B46C1",
  },
  hotelPrice: {
    fontSize: 16,
    color: "#6B46C1",
    marginTop: 5,
  },
  hotelType: {
    fontSize: 14,
    color: "#718096",
    marginTop: 5,
  },
  datePickerContainer: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#6B46C1",
    borderRadius: 10,
    padding: 15,
  },
  availabilityText: {
    fontSize: 16,
    color: "#6B46C1",
    marginTop: 10,
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
  rulesContainer: {
    marginTop: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#6B46C1",
  },
  rulesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#6B46C1",
  },
  rulesContent: {
    overflow: "hidden",
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  ruleIcon: {
    marginRight: 10,
  },
  ruleText: {
    flex: 1,
    fontSize: 16,
    color: "#4A5568",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  errorContainer: {
    padding: 10,
    backgroundColor: "#FFEBEE",
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: "#B71C1C",
    fontSize: 16,
  },
});

export default PetHotelBooking;
