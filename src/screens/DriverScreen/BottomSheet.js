import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ScrollView,
  Linking,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Modal from "react-native-modal";
import {
  acceptRide,
  updateRideStatus,
  getStoredDriverData,
} from "../API/apiService";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const BottomSheet = ({ isVisible, onClose, ride, onRefresh }) => {
  const handleAcceptRide = async () => {
    try {
      const { token, driverId } = await getStoredDriverData();
      console.log("Stored driver data:", { token, driverId });
      console.log("Attempting to accept ride:", ride.id);
      const updatedRide = await acceptRide(ride.id, driverId, token);
      console.log("Ride accepted successfully:", updatedRide);
      Alert.alert("Ride Accepted", `You've accepted ride #${ride.id}`);
      onRefresh();
    } catch (error) {
      console.error(
        "Error accepting ride:",
        error.response?.data || error.message
      );
      Alert.alert("Error", "Failed to accept ride. Please try again.");
    }
  };

  const handleOpenMap = (latitude, longitude, label) => {
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${latitude},${longitude}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    Linking.openURL(url);
  };

  const handleArrived = async () => {
    Alert.alert(
      "Confirm Arrival",
      "Are you sure you have arrived at the customer's location?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              const { token } = await getStoredDriverData();
              const updatedRide = await updateRideStatus(
                ride.id,
                "IN_PROGRESS",
                token
              );
              console.log("Ride status updated to IN_PROGRESS:", updatedRide);
              Alert.alert(
                "Status Updated",
                "Ride status has been updated to In Progress"
              );
              onRefresh();
            } catch (error) {
              console.error("Error updating ride status:", error);
              Alert.alert(
                "Error",
                "Failed to update ride status. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const handleCompleteRide = async () => {
    Alert.alert(
      "Complete Ride",
      "Are you sure you want to complete this ride?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              const { token } = await getStoredDriverData();
              const updatedRide = await updateRideStatus(
                ride.id,
                "COMPLETED",
                token
              );
              console.log("Ride status updated to COMPLETED:", updatedRide);
              Alert.alert(
                "Ride Completed",
                "The ride has been marked as completed."
              );
              onRefresh();
              onClose();
            } catch (error) {
              console.error("Error completing ride:", error);
              Alert.alert(
                "Error",
                "Failed to complete the ride. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  if (!ride) {
    return null;
  }

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={["down"]}
      style={styles.bottomSheet}
      propagateSwipe
    >
      <View style={styles.bottomSheetContent}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>
              Ride #{ride.id?.toString().padStart(5, "0") ?? "N/A"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.rideDetails}>
            <DetailRow
              icon="map-marker"
              text={`Pickup: ${ride.pickup_location}`}
            />
            <DetailRow
              icon="map-marker-check"
              text={`Dropoff: ${ride.dropoff_location}`}
            />
            <DetailRow icon="paw" text={`Pet Type: ${ride.pet_type}`} />
            <DetailRow
              icon="cash"
              text={`Fare: ${
                ride.fare != null ? `RM${ride.fare.toFixed(2)}` : "N/A"
              }`}
            />
          </View>
          <View style={styles.specialInstructions}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <Text style={styles.instructionsText}>
              {ride.special_instructions || "No special instructions provided."}
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            {ride.status === "PENDING" && (
              <ActionButton onPress={handleAcceptRide} text="Accept Ride" />
            )}
            {ride.status === "ACCEPTED" && (
              <>
                <ActionButton
                  onPress={() =>
                    handleOpenMap(
                      ride.pickup_latitude,
                      ride.pickup_longitude,
                      "Pickup Location"
                    )
                  }
                  text="Open Pickup in Maps"
                />
                <ActionButton
                  onPress={handleArrived}
                  text="Arrived at Customer"
                />
              </>
            )}
            {ride.status === "IN_PROGRESS" && (
              <>
                <ActionButton
                  onPress={() =>
                    handleOpenMap(
                      ride.dropoff_latitude,
                      ride.dropoff_longitude,
                      "Dropoff Location"
                    )
                  }
                  text="Open Dropoff in Maps"
                />
                <ActionButton
                  onPress={handleCompleteRide}
                  text="Complete Ride"
                />
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const DetailRow = ({ icon, text }) => (
  <View style={styles.detailRow}>
    <Icon name={icon} size={20} color="#6B46C1" />
    <Text style={styles.detailText}>{text}</Text>
  </View>
);

const ActionButton = ({ onPress, text }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <Text style={styles.buttonText}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  bottomSheet: {
    justifyContent: "flex-end",
    margin: 0,
  },
  bottomSheetContent: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A5568",
  },
  closeButton: {
    backgroundColor: "#6B46C1",
    borderRadius: 20,
    padding: 5,
  },
  rideDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#4A5568",
  },
  specialInstructions: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A5568",
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 16,
    color: "#4A5568",
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: "#6B46C1",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BottomSheet;
