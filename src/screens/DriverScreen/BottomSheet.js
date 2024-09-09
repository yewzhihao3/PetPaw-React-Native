import React, { useState, useEffect } from "react";
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
} from "./DriverapiService";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const BottomSheet = ({ isVisible, onClose, ride, onRefresh }) => {
  const [localRide, setLocalRide] = useState(ride);

  useEffect(() => {
    setLocalRide(ride);
  }, [ride]);

  const handleAcceptRide = async () => {
    Alert.alert(
      "Confirm Ride Acceptance",
      "Are you sure you want to accept this ride?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Accept",
          onPress: async () => {
            try {
              const { token, driverId } = await getStoredDriverData();
              console.log("Stored driver data:", { token, driverId });
              console.log("Attempting to accept ride:", localRide.id);
              const updatedRide = await acceptRide(
                localRide.id,
                driverId,
                token
              );
              console.log("Ride accepted successfully:", updatedRide);
              Alert.alert(
                "Ride Accepted",
                `You've accepted ride #${localRide.id}`
              );
              setLocalRide(updatedRide);
              onRefresh();
            } catch (error) {
              console.error(
                "Error accepting ride:",
                error.response?.data || error.message
              );
              Alert.alert("Error", "Failed to accept ride. Please try again.");
            }
          },
        },
      ]
    );
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
                localRide.id,
                "IN_PROGRESS",
                token
              );
              console.log("Ride status updated to IN_PROGRESS:", updatedRide);
              Alert.alert(
                "Status Updated",
                "Ride status has been updated to In Progress"
              );
              setLocalRide(updatedRide);
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
                localRide.id,
                "COMPLETED",
                token
              );
              console.log("Ride status updated to COMPLETED:", updatedRide);
              Alert.alert(
                "Ride Completed",
                "The ride has been marked as completed."
              );
              setLocalRide(updatedRide);
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

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "#FFA500"; // Orange
      case "ACCEPTED":
        return "#4CAF50"; // Green
      case "IN_PROGRESS":
        return "#2196F3"; // Blue
      case "COMPLETED":
        return "#9C27B0"; // Purple
      default:
        return "#757575"; // Grey
    }
  };

  if (!localRide) {
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
        <View style={styles.handle} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>
                Ride #{localRide.id?.toString().padStart(5, "0") ?? "N/A"}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(localRide.status) },
                ]}
              >
                <Text style={styles.statusText}>{localRide.status}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer</Text>
            <View style={styles.customerInfo}>
              <Icon name="account" size={24} color="#6B46C1" />
              <View style={styles.customerDetails}>
                <Text style={styles.customerName}>
                  {localRide.user?.name || "N/A"}
                </Text>
                <Text style={styles.customerPhone}>
                  {localRide.user?.phone_number || "N/A"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ride Details</Text>
            <DetailRow
              icon="map-marker"
              label="Pickup"
              text={localRide.pickup_location}
            />
            <DetailRow
              icon="map-marker-check"
              label="Dropoff"
              text={localRide.dropoff_location}
            />
            <DetailRow icon="paw" label="Pet Type" text={localRide.pet_type} />
            <DetailRow
              icon="cash"
              label="Fare"
              text={
                localRide.fare != null
                  ? `RM${localRide.fare.toFixed(2)}`
                  : "N/A"
              }
            />
          </View>

          {localRide.special_instructions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Special Instructions</Text>
              <Text style={styles.instructionsText}>
                {localRide.special_instructions}
              </Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            {localRide.status === "PENDING" && (
              <ActionButton
                onPress={handleAcceptRide}
                text="Accept Ride"
                icon="check-circle"
              />
            )}
            {localRide.status === "ACCEPTED" && (
              <>
                <ActionButton
                  onPress={() =>
                    handleOpenMap(
                      localRide.pickup_latitude,
                      localRide.pickup_longitude,
                      "Pickup Location"
                    )
                  }
                  text="Open Pickup in Maps"
                  icon="map-marker"
                />
                <ActionButton
                  onPress={handleArrived}
                  text="Arrived at Customer"
                  icon="check-circle"
                />
              </>
            )}
            {localRide.status === "IN_PROGRESS" && (
              <>
                <ActionButton
                  onPress={() =>
                    handleOpenMap(
                      localRide.dropoff_latitude,
                      localRide.dropoff_longitude,
                      "Dropoff Location"
                    )
                  }
                  text="Open Dropoff in Maps"
                  icon="map-marker"
                />
                <ActionButton
                  onPress={handleCompleteRide}
                  text="Complete Ride"
                  icon="flag-checkered"
                />
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const DetailRow = ({ icon, label, text }) => (
  <View style={styles.detailRow}>
    <Icon name={icon} size={24} color="#6B46C1" style={styles.detailIcon} />
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailText}>{text}</Text>
    </View>
  </View>
);

const ActionButton = ({ onPress, text, icon }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    {icon && (
      <Icon
        name={icon}
        size={24}
        color="#fff"
        style={styles.actionButtonIcon}
      />
    )}
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.9,
    paddingTop: 10,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6B46C1",
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  closeButton: {
    backgroundColor: "#6B46C1",
    borderRadius: 20,
    padding: 5,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A5568",
    marginBottom: 10,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  customerDetails: {
    marginLeft: 15,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A5568",
  },
  customerPhone: {
    fontSize: 14,
    color: "#6B46C1",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  detailIcon: {
    marginTop: 2,
  },
  detailTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  detailLabel: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 2,
  },
  detailText: {
    fontSize: 16,
    color: "#4A5568",
  },
  instructionsText: {
    fontSize: 16,
    color: "#4A5568",
    lineHeight: 24,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  actionButton: {
    backgroundColor: "#6B46C1",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  actionButtonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BottomSheet;
