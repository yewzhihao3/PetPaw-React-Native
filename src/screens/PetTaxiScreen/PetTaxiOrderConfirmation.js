import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { fetchPetTaxiRideById } from "../API/apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PetTaxiOrderConfirmation = () => {
  const [rideDetails, setRideDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const route = useRoute();
  const navigation = useNavigation();
  const { rideId } = route.params || {};

  useEffect(() => {
    if (rideId) {
      fetchRideDetails();
    } else {
      setError("No ride ID provided.");
      setLoading(false);
    }
  }, [rideId]);

  const fetchRideDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const details = await fetchPetTaxiRideById(rideId, token);
      setRideDetails(details);
    } catch (error) {
      console.error("Error fetching ride details:", error);
      setError("Failed to load ride details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (rideId) {
      fetchRideDetails();
    } else {
      Alert.alert("Error", "No ride ID available. Please try booking again.");
      navigation.navigate("PetTaxiHome");
    }
  };

  const handleViewMap = () => {
    navigation.navigate("PetTaxiMapView", { rideId: rideDetails.id });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "#7C3AED";
      case "ACCEPTED":
        return "#7C3AED";
      case "IN_PROGRESS":
        return "#7C3AED";
      case "COMPLETED":
        return "#7C3AED";
      case "CANCELLED":
        return "#7C3AED";
      default:
        return "#7C3AED";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Loading ride details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !rideDetails) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || "No ride details found."}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate("PetTaxiHome")}
            style={styles.backButton}
          >
            <Ionicons name="close" size={24} color="#7C3AED" />
          </TouchableOpacity>
          <Text style={styles.title}>Ride Confirmation</Text>
          <View style={styles.headerRight} />
        </View>
        <ScrollView style={styles.scrollView}>
          <View style={styles.card}>
            <Text style={styles.confirmationText}>
              Your ride has been booked successfully!
            </Text>
            <Text style={styles.orderNumber}>
              Ride Number: {rideDetails.id}
            </Text>
            <View style={styles.detailsContainer}>
              <DetailItem label="Pickup" value={rideDetails.pickup_location} />
              <DetailItem
                label="Dropoff"
                value={rideDetails.dropoff_location}
              />
              <DetailItem label="Pet Type" value={rideDetails.pet_type} />
              <DetailItem
                label="Status"
                value={rideDetails.status}
                customStyle={{ color: getStatusColor(rideDetails.status) }}
              />
            </View>
            <TouchableOpacity
              style={styles.viewMapButton}
              onPress={handleViewMap}
            >
              <Text style={styles.viewMapButtonText}>View on Map</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const DetailItem = ({ label, value, customStyle }) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={[styles.detailValue, customStyle]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FF",
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7C3AED",
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4B5563",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    margin: 20,
    elevation: 3,
  },
  confirmationText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: "#4B5563",
    fontWeight: "bold",
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#7C3AED",
  },
  detailsContainer: {
    marginTop: 20,
  },
  detailItem: {
    flexDirection: "row",
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4B5563",
    flex: 0.4,
  },
  detailValue: {
    fontSize: 16,
    color: "#4A5568",
    flex: 0.6,
  },
  viewMapButton: {
    backgroundColor: "#7C3AED",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  viewMapButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PetTaxiOrderConfirmation;
