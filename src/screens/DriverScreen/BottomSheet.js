import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  Dimensions,
  StyleSheet,
  Alert,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Modal from "react-native-modal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDriverLocation } from "./DriverLocationContext";
import { DriverLocationNotificationManager } from "./DriverNotificationManager";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const NoRide = ({ fadeAnim, onRefresh }) => (
  <Animated.View style={[styles.noRidesContainer, { opacity: fadeAnim }]}>
    <Icon name="car" size={100} color="#5E17EB" />
    <Text style={styles.noRidesText}>No active rides at the moment</Text>
    <Text style={styles.noRidesSubText}>
      New ride requests will appear here when they're available
    </Text>
    <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
      <Text style={styles.refreshButtonText}>Refresh</Text>
    </TouchableOpacity>
  </Animated.View>
);

const BottomSheet = ({
  isVisible,
  onClose,
  ride,
  handleUpdateStatus,
  onRefresh,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const { location } = useDriverLocation();
  const [isMapOpen, setIsMapOpen] = useState(false);

  useEffect(() => {
    if (isVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [isVisible, fadeAnim]);

  const openGoogleMaps = (address) => {
    if (!address) return;
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${address.latitude},${address.longitude}`;
    const label = "Pickup Location";
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    setIsMapOpen(true);
    DriverLocationNotificationManager.setupNotification();
    Linking.openURL(url);
  };

  const renderEarnings = () => {
    if (!ride) return "N/A";
    if (ride.status === "ACCEPTED" || ride.driver_earnings === 0) {
      return `Estimated: RM${ride.fare?.toFixed(2) ?? "0.00"}`;
    }
    return `RM${ride.driver_earnings?.toFixed(2) ?? "0.00"}`;
  };

  const handleClose = useCallback(() => {
    if (isMapOpen) {
      DriverLocationNotificationManager.cancelNotification();
      setIsMapOpen(false);
    }
    onClose();
  }, [isMapOpen, onClose]);

  const handleStatusUpdate = async (rideId, newStatus) => {
    try {
      const driverId = await AsyncStorage.getItem("userId");
      await handleUpdateStatus(rideId, newStatus, driverId, location);
    } catch (error) {
      console.error("Error updating ride status:", error);
      Alert.alert("Error", "Failed to update ride status. Please try again.");
    }
  };

  const renderRideContent = () => {
    if (!ride) return null;

    return (
      <>
        <View style={styles.bottomSheetHeader}>
          <Text style={styles.bottomSheetTitle}>
            Ride #{ride.id?.toString().padStart(5, "0") ?? "N/A"}
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          {/* Ride Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ride Info</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              <Text style={[styles.value, styles.statusText]}>
                {ride.status ?? "N/A"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Request Time:</Text>
              <Text style={styles.value}>
                {ride.created_at
                  ? new Date(ride.created_at).toLocaleString()
                  : "N/A"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Estimated Duration:</Text>
              <Text style={styles.value}>
                {ride.estimated_duration ?? "N/A"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Your Earnings:</Text>
              <Text style={[styles.value, styles.earningsText]}>
                {renderEarnings()}
              </Text>
            </View>
          </View>

          {/* Passenger Details */}
          {ride.passenger && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Passenger Details</Text>
              <Text style={styles.passengerName}>
                {ride.passenger.name ?? "N/A"}
              </Text>
              <Text style={styles.passengerPhone}>
                {ride.passenger.phone ?? "N/A"}
              </Text>
            </View>
          )}

          {/* Pickup and Dropoff */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pickup Location</Text>
            <Text style={styles.address}>{ride.pickup_address ?? "N/A"}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dropoff Location</Text>
            <Text style={styles.address}>{ride.dropoff_address ?? "N/A"}</Text>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {ride.pickup_location && (
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => openGoogleMaps(ride.pickup_location)}
            >
              <Icon name="map-marker" size={24} color="#fff" />
              <Text style={styles.buttonText}>Open in Maps</Text>
            </TouchableOpacity>
          )}

          {ride.status === "REQUESTED" && (
            <TouchableOpacity
              style={styles.updateStatusButton}
              onPress={() => handleStatusUpdate(ride.id, "ACCEPTED")}
            >
              <Text style={styles.buttonText}>Accept Ride</Text>
            </TouchableOpacity>
          )}
          {ride.status === "ACCEPTED" && (
            <TouchableOpacity
              style={styles.updateStatusButton}
              onPress={() => handleStatusUpdate(ride.id, "PICKED_UP")}
            >
              <Text style={styles.buttonText}>Picked Up Passenger</Text>
            </TouchableOpacity>
          )}
          {ride.status === "PICKED_UP" && (
            <TouchableOpacity
              style={styles.updateStatusButton}
              onPress={() => handleStatusUpdate(ride.id, "COMPLETED")}
            >
              <Text style={styles.buttonText}>Complete Ride</Text>
            </TouchableOpacity>
          )}
        </View>
      </>
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleClose}
      onSwipeComplete={handleClose}
      swipeDirection={["down"]}
      style={styles.bottomSheet}
      propagateSwipe
      useNativeDriverForBackdrop
    >
      <View
        style={[styles.bottomSheetContent, { maxHeight: SCREEN_HEIGHT * 0.8 }]}
      >
        {!ride ? (
          <NoRide fadeAnim={fadeAnim} onRefresh={onRefresh} />
        ) : (
          renderRideContent()
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    justifyContent: "flex-end",
    margin: 0,
  },
  bottomSheetContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  scrollView: {
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  label: {
    fontWeight: "500",
  },
  value: {
    color: "#666",
  },
  statusText: {
    fontWeight: "bold",
    color: "#5E17EB",
  },
  earningsText: {
    fontWeight: "bold",
    color: "#00A86B",
  },
  customerName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  customerPhone: {
    fontSize: 14,
    marginBottom: 10,
  },
  customerAddress: {
    fontSize: 14,
    color: "#666",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  itemName: {
    flex: 1,
  },
  itemQuantity: {
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  mapButton: {
    backgroundColor: "#5E17EB",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  updateStatusButton: {
    backgroundColor: "#00A86B",
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  noOrdersContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noOrdersText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    textAlign: "center",
  },
  noOrdersSubText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  refreshButton: {
    backgroundColor: "#5E17EB",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  refreshButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },

  noRidesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noRidesText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    textAlign: "center",
  },
  noRidesSubText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  passengerName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  passengerPhone: {
    fontSize: 14,
    marginBottom: 10,
  },
  address: {
    fontSize: 14,
    color: "#666",
  },
});

export default BottomSheet;
