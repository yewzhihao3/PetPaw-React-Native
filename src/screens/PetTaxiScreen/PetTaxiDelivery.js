import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Icon from "react-native-feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchPetTaxiRideById, fetchDriverLocation } from "../API/apiService";
import PetTaxiMapView from "./PetTaxiMapView";
import PetTaxiRideStatus from "./PetTaxiRideStatus";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function PetTaxiDelivery() {
  const navigation = useNavigation();
  const route = useRoute();
  const [ride, setRide] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  const { rideId } = route.params;

  const fetchRideData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Route params:", route.params);
      if (rideId) {
        const token = await AsyncStorage.getItem("userToken");
        const fullRideData = await fetchPetTaxiRideById(rideId, token);
        setRide(fullRideData);
        if (fullRideData.driver_id) {
          // Fetch driver info here
          // const driverData = await fetchDriverData(fullRideData.driver_id, token);
          // setDriverInfo(driverData);
        } else {
          setDriverInfo(null);
        }
      }
      await fetchDriverLocationUpdate();
    } catch (error) {
      console.error("Error fetching ride data:", error);
      Alert.alert("Error", "Failed to load ride data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [rideId]);

  const fetchDriverLocationUpdate = useCallback(async () => {
    if (ride?.driver_id) {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const location = await fetchDriverLocation(ride.driver_id, token);
        console.log("Fetched driver location:", location);
        if (location && location.latitude !== 0 && location.longitude !== 0) {
          setDriverLocation(location);
        } else {
          console.log("No valid location data available for driver.");
          setDriverLocation(null);
        }
      } catch (error) {
        console.error("Error fetching driver location:", error);
        setDriverLocation(null);
      }
    }
  }, [ride?.driver_id]);

  useEffect(() => {
    fetchRideData();
  }, [fetchRideData]);

  useEffect(() => {
    const locationInterval = setInterval(fetchDriverLocationUpdate, 10000); // Update every 10 seconds
    return () => clearInterval(locationInterval);
  }, [fetchDriverLocationUpdate]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5B21B6" />
        <Text>Loading ride data...</Text>
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error loading ride data. Please try again.</Text>
      </View>
    );
  }

  const driverName = driverInfo?.name || "Driver Name Not Available";
  const driverVehicle = driverInfo?.vehicle_type || "N/A";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mapContainer}>
          <PetTaxiMapView ride={ride} driverLocation={driverLocation} />
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.estimatedArrivalContainer}>
            <View>
              <Text style={styles.estimatedArrivalTitle}>
                Estimated Arrival
              </Text>
              <Text style={styles.estimatedArrivalTime}>
                {ride.estimated_arrival_time || "Calculating..."}
              </Text>
              <PetTaxiRideStatus status={ride.status} />
            </View>
            <Image
              style={styles.petTaxiImage}
              source={require("../../../assets/PetTaxi/pet-taxi-icon.png")}
            />
          </View>
          <View style={styles.driverContainer}>
            {driverInfo?.image_url ? (
              <Image
                style={styles.driverImage}
                source={{ uri: driverInfo.image_url }}
                onError={(e) => {
                  console.log(
                    "Error loading driver image:",
                    e.nativeEvent.error
                  );
                }}
              />
            ) : (
              <View style={[styles.driverImage, styles.placeholderContainer]}>
                <Icon.User
                  stroke="white"
                  fill="#5B21B6"
                  width={40}
                  height={40}
                />
              </View>
            )}
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{driverName}</Text>
              <View style={styles.vehicleContainer}>
                <Text style={styles.vehicleType}>{driverVehicle}</Text>
              </View>
            </View>
          </View>
          <View style={styles.rideDetails}>
            <Text style={styles.rideDetailsTitle}>Ride Details</Text>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Pickup:</Text>
              <Text style={styles.detailValue}>{ride.pickup_location}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Dropoff:</Text>
              <Text style={styles.detailValue}>{ride.dropoff_location}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Pet Type:</Text>
              <Text style={styles.detailValue}>{ride.pet_type}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Special Instructions:</Text>
              <Text style={styles.detailValue}>
                {ride.special_instructions || "None"}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status:</Text>
              <PetTaxiRideStatus status={ride.status} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scrollContent: {
    flexGrow: 1,
  },
  mapContainer: {
    height: SCREEN_HEIGHT * 0.4,
    position: "relative",
  },
  infoContainer: {
    padding: 20,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  estimatedArrivalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  estimatedArrivalTitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  estimatedArrivalTime: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#5B21B6",
    marginVertical: 5,
  },
  rideStatus: {
    fontSize: 14,
    color: "#6B7280",
  },
  petTaxiImage: {
    width: 80,
    height: 80,
  },
  driverContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5B21B6",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  driverImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "white",
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  driverStatus: {
    color: "white",
    fontSize: 14,
    opacity: 0.9,
  },
  vehicleContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  vehicleType: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  rideDetails: {
    marginTop: 20,
  },
  rideDetailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#374151",
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 16,
    color: "#4B5563",
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 20,
  },
  placeholderContainer: {
    backgroundColor: "#5B21B6",
    justifyContent: "center",
    alignItems: "center",
  },
});
