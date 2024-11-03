import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Animated,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BookingHistory = ({ bookings }) => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  // Sort bookings by date (latest to oldest)
  const sortedBookings = [...bookings].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.start_time}`);
    const dateB = new Date(`${b.date} ${b.start_time}`);
    return dateB - dateA;
  });

  // Get limited or all bookings based on showAllBookings state
  const displayedBookings = showAllBookings
    ? sortedBookings
    : sortedBookings.slice(0, 3);

  const showModal = () => {
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideModal = () => {
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setSelectedBooking(null);
    });
  };

  const calculateTotalPrice = (services) => {
    return services.reduce((total, service) => total + service.price, 0);
  };

  const getStatusStyle = (status) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return { backgroundColor: "#E6F4EA", borderColor: "#4CAF50" };
      case "UPCOMING":
        return { backgroundColor: "#E3F2FD", borderColor: "#2196F3" };
      case "PENDING":
        return { backgroundColor: "#FFF8E1", borderColor: "#FFC107" };
      case "CANCELLED":
        return { backgroundColor: "#FFEBEE", borderColor: "#F44336" };
      case "IN PROGRESS":
        return { backgroundColor: "#FFF3E0", borderColor: "#FF9800" };
      case "CONFIRMED":
        return { backgroundColor: "#F1F8E9", borderColor: "#8BC34A" };
      default:
        return {};
    }
  };

  const getStatusTextStyle = (status) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return { color: "#4CAF50" };
      case "UPCOMING":
        return { color: "#2196F3" };
      case "PENDING":
        return { color: "#FFC107" };
      case "CANCELLED":
        return { color: "#F44336" };
      case "IN PROGRESS":
        return { color: "#FF9800" };
      case "CONFIRMED":
        return { color: "#8BC34A" };
      default:
        return {};
    }
  };

  const renderBookingItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => {
        setSelectedBooking(item);
        showModal();
      }}
    >
      <View style={styles.bookingHeader}>
        <View style={styles.petInfo}>
          <Ionicons name="paw" size={24} color="#8A2BE2" />
          <Text style={styles.petName}>{item.pet_name}</Text>
        </View>
        <View style={[styles.statusIndicator, getStatusStyle(item.status)]}>
          <Text style={[styles.statusText, getStatusTextStyle(item.status)]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={20} color="#8A2BE2" />
          <Text style={styles.detailText}>
            {new Date(item.date).toDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={20} color="#8A2BE2" />
          <Text style={styles.detailText}>{item.start_time}</Text>
        </View>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.totalPrice}>
          RM {calculateTotalPrice(item.services).toFixed(2)}
        </Text>
        <Ionicons name="chevron-forward" size={24} color="#8A2BE2" />
      </View>
    </TouchableOpacity>
  );

  const ShowMoreButton = () => (
    <TouchableOpacity
      style={styles.showMoreButton}
      onPress={() => setShowAllBookings(!showAllBookings)}
    >
      <Text style={styles.showMoreText}>
        {showAllBookings ? "Show Less" : "Show More"}
      </Text>
      <Ionicons
        name={showAllBookings ? "chevron-up" : "chevron-down"}
        size={20}
        color="#8A2BE2"
      />
    </TouchableOpacity>
  );

  if (bookings.length === 0) {
    return (
      <View style={styles.noBookingsContainer}>
        <Text style={styles.noBookingsText}>No bookings yet.</Text>
        <Text style={styles.encouragementText}>
          Book your first grooming session today!
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={displayedBookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={() => bookings.length > 3 && <ShowMoreButton />}
      />

      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={hideModal}
      >
        <View style={styles.centeredView}>
          <Animated.View
            style={[
              styles.modalView,
              {
                opacity: fadeAnimation,
                transform: [
                  {
                    translateY: slideAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {selectedBooking && (
              <>
                <Text style={styles.modalTitle}>Booking Details</Text>
                <View style={styles.detailsContainer}>
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="paw" size={24} color="#8A2BE2" />
                    <Text style={styles.modalText}>
                      {selectedBooking.pet_name}
                    </Text>
                  </View>

                  <View style={styles.modalDetailRow}>
                    <Ionicons name="calendar" size={24} color="#8A2BE2" />
                    <Text style={styles.modalText}>
                      {new Date(selectedBooking.date).toDateString()}
                    </Text>
                  </View>

                  <View style={styles.modalDetailRow}>
                    <Ionicons name="time" size={24} color="#8A2BE2" />
                    <Text style={styles.modalText}>
                      {selectedBooking.start_time}
                    </Text>
                  </View>

                  <View style={styles.modalDetailRow}>
                    <Ionicons name="bookmark" size={24} color="#8A2BE2" />
                    <View
                      style={[
                        styles.statusIndicator,
                        getStatusStyle(selectedBooking.status),
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          getStatusTextStyle(selectedBooking.status),
                        ]}
                      >
                        {selectedBooking.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.servicesContainer}>
                    <Text style={styles.servicesTitle}>Services:</Text>
                    {selectedBooking.services.map((service, index) => (
                      <View key={index} style={styles.serviceItem}>
                        <Text style={styles.serviceName}>{service.name}</Text>
                        <Text style={styles.servicePrice}>
                          RM {service.price.toFixed(2)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.durationContainer}>
                    <Ionicons name="time-outline" size={24} color="#8A2BE2" />
                    <Text style={styles.durationText}>
                      Duration: {selectedBooking.duration} minutes
                    </Text>
                  </View>

                  <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total Price</Text>
                    <Text style={styles.totalAmount}>
                      RM{" "}
                      {calculateTotalPrice(selectedBooking.services).toFixed(2)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={hideModal}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8FF",
  },
  listContainer: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#8A2BE2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#8A2BE2",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  petInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  petName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8A2BE2",
    marginLeft: 8,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  bookingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F0E6FF",
    paddingTop: 12,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8A2BE2",
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: "#8A2BE2",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  showMoreText: {
    color: "#8A2BE2",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  noBookingsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 12,
    margin: 16,
    shadowColor: "#8A2BE2",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noBookingsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8A2BE2",
    marginBottom: 8,
  },
  encouragementText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(138, 43, 226, 0.5)",
  },
  modalView: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8A2BE2",
    marginBottom: 20,
  },
  detailsContainer: {
    width: "100%",
    backgroundColor: "#F8F8FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  modalDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    color: "#4B0082",
    marginLeft: 12,
  },
  servicesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E6E6FA",
  },
  servicesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8A2BE2",
    marginBottom: 12,
  },
  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  serviceName: {
    fontSize: 16,
    color: "#4B0082",
  },
  servicePrice: {
    fontSize: 16,
    color: "#8A2BE2",
    fontWeight: "600",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E6E6FA",
  },
  durationText: {
    fontSize: 16,
    color: "#4B0082",
    marginLeft: 12,
  },
  totalContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E6E6FA",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4B0082",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8A2BE2",
  },
  closeButton: {
    backgroundColor: "#8A2BE2",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    minWidth: 120,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default BookingHistory;
