import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  getPendingRides,
  getStoredDriverData,
  updateDriverLocation,
  getCurrentLocationForDriver,
} from "../API/apiService";
import BottomSheet from "./BottomSheet";
import { useDriverStatus } from "./DriverStatusContext";

const ACTIVE_RIDE_STATUSES = ["PENDING", "ACCEPTED", "IN_PROGRESS"];

const DriverRides = () => {
  const [rides, setRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isOnline } = useDriverStatus();

  const fetchRides = useCallback(async () => {
    if (!isOnline) {
      setRides([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { token } = await getStoredDriverData();
      const fetchedRides = await getPendingRides(token);
      const activeRides = fetchedRides.filter((ride) =>
        ACTIVE_RIDE_STATUSES.includes(ride.status)
      );
      setRides(activeRides);
    } catch (error) {
      console.error("Error fetching rides:", error);
      Alert.alert("Error", "Failed to fetch rides. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  const handleManualLocationUpdate = useCallback(async () => {
    try {
      const location = await getCurrentLocationForDriver();
      if (location) {
        const { token, driverId } = await getStoredDriverData();
        if (!token || !driverId) {
          Alert.alert("Error", "You are not logged in");
          return;
        }
        await updateDriverLocation(
          driverId,
          location.coords.latitude,
          location.coords.longitude,
          token
        );
        Alert.alert("Success", "Your location has been updated.");
      } else {
        Alert.alert("Error", "Failed to get current location.");
      }
    } catch (error) {
      console.error("Error updating location:", error);
      Alert.alert("Error", "Failed to update location. Please try again.");
    }
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "#FFA500"; // Orange
      case "ACCEPTED":
        return "#4CAF50"; // Green
      case "IN_PROGRESS":
        return "#2196F3"; // Blue
      default:
        return "#757575"; // Grey
    }
  };

  const renderRideItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.rideItem}
        onPress={() => {
          setSelectedRide(item);
          setIsBottomSheetVisible(true);
        }}
      >
        <View style={styles.rideHeader}>
          <Text style={styles.rideNumber}>Ride #{item.id}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.rideDetails}>
          <Icon name="cash" size={20} color="#5E17EB" style={styles.icon} />
          <Text style={styles.rideAmount}>
            RM{item.fare ? item.fare.toFixed(2) : "N/A"}
          </Text>
        </View>
        <View style={styles.rideDetails}>
          <Icon
            name="map-marker"
            size={20}
            color="#5E17EB"
            style={styles.icon}
          />
          <Text style={styles.rideAddress} numberOfLines={1}>
            {item.pickup_location}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5E17EB" />
      <View style={styles.header}>
        <Text style={styles.title}>Active Rides</Text>
        <TouchableOpacity onPress={fetchRides} style={styles.refreshButton}>
          <Icon name="refresh" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.updateLocationButton}
        onPress={handleManualLocationUpdate}
      >
        <Icon
          name="crosshairs-gps"
          size={20}
          color="#FFFFFF"
          style={styles.buttonIcon}
        />
        <Text style={styles.updateLocationButtonText}>Update Location</Text>
      </TouchableOpacity>
      {loading ? (
        <View style={styles.centered}>
          <Text>Loading rides...</Text>
        </View>
      ) : (
        <FlatList
          data={rides}
          renderItem={renderRideItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.rideList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="clipboard-text-outline" size={80} color="#5E17EB" />
              <Text style={styles.emptyStateText}>
                No active rides at the moment
              </Text>
            </View>
          }
        />
      )}
      <BottomSheet
        isVisible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
        ride={selectedRide}
        onRefresh={fetchRides}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8FF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#5E17EB",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  refreshButton: {
    padding: 8,
  },
  updateLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7B3FF2",
    padding: 12,
    margin: 16,
    borderRadius: 8,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  updateLocationButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  rideList: {
    padding: 16,
  },
  rideItem: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rideNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  rideDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  rideAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5E17EB",
  },
  rideAddress: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: "#5E17EB",
    textAlign: "center",
    marginTop: 16,
  },
});

export default DriverRides;
