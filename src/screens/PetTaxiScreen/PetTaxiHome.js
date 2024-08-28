import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserPetTaxiRides } from "../../screens/API/apiService";
import { Ionicons } from "@expo/vector-icons"; // Make sure to install expo vector icons

const PetTaxiHome = () => {
  const [recentRides, setRecentRides] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchRecentRides();
  }, []);

  const fetchRecentRides = async () => {
    try {
      const rides = await getUserPetTaxiRides();
      setRecentRides(rides);
    } catch (error) {
      console.error("Error fetching recent rides:", error);
    }
  };

  const renderRideItem = ({ item }) => (
    <View style={styles.rideItem}>
      <Text style={styles.rideDate}>
        {new Date(item.created_at).toLocaleString()}
      </Text>
      <Text style={styles.rideText}>From: {item.pickup_location}</Text>
      <Text style={styles.rideText}>To: {item.dropoff_location}</Text>
      <Text style={styles.rideStatus}>Status: {item.status}</Text>
    </View>
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
          <Text style={styles.title}>Pet Taxi</Text>
          <View style={styles.headerRight}>
            <Image
              source={require("../../../assets/PetTaxi/pet-taxi-icon.png")}
              style={styles.headerIcon}
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.placeOrderButton}
          onPress={() => navigation.navigate("PetTaxiPlaceOrder")}
        >
          <Text style={styles.buttonText}>Book a Ride</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle}>Recent Rides</Text>
        <FlatList
          data={recentRides}
          renderItem={renderRideItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No recent rides</Text>
          }
        />
      </View>
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
    fontSize: 28,
    fontWeight: "bold",
    color: "#5B21B6",
  },
  headerRight: {
    width: 40, // To balance the header
  },
  headerIcon: {
    width: 40,
    height: 40,
  },
  placeOrderButton: {
    backgroundColor: "#7C3AED",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4B5563",
    marginBottom: 10,
  },
  rideItem: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  rideDate: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 5,
  },
  rideText: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 3,
  },
  rideStatus: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#5B21B6",
    marginTop: 5,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#6B7280",
    marginTop: 20,
  },
});

export default PetTaxiHome;
