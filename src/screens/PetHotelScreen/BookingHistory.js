import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const BookingHistory = ({ bookings }) => {
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  if (!bookings) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B46C1" />
      </View>
    );
  }

  const displayedHistory = showAllHistory ? bookings : bookings.slice(0, 3);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // This will return 'YYYY-MM-DD'
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "CHECKED_OUT":
        return "#4CAF50";
      case "CHECKED_IN":
        return "#FFC107";
      case "CONFIRMED":
        return "#2196F3";
      case "CANCELLED":
        return "#F44336";
      case "PENDING":
        return "#FF9800";
      default:
        return "#9E9E9E";
    }
  };

  const openModal = (booking) => {
    setSelectedBooking(booking);
    setModalVisible(true);
  };

  if (bookings.length === 0) {
    return (
      <View style={styles.historyContainer}>
        <Text style={styles.sectionTitle}>Booking History</Text>
        <Text style={styles.noBookingsText}>No bookings found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.historyContainer}>
      <View style={styles.historyHeader}>
        <Text style={styles.sectionTitle}>Booking History</Text>
        {bookings.length > 3 && (
          <TouchableOpacity onPress={() => setShowAllHistory(!showAllHistory)}>
            <Text style={styles.showMoreButton}>
              {showAllHistory ? "Show Less" : "Show More"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {displayedHistory.map((booking) => (
        <TouchableOpacity
          key={booking.id}
          style={styles.historyItem}
          onPress={() => openModal(booking)}
        >
          <View>
            <Text style={styles.historyHotelName}>
              {booking.hotel?.name || `Hotel ${booking.hotel_id}`}
            </Text>
            <Text style={styles.historyDates}>
              {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(booking.status) },
            ]}
          >
            <Text style={styles.statusText}>{booking.status}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Booking Details</Text>
            {selectedBooking && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.modalContent}
              >
                <View style={styles.statusContainer}>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getStatusColor(selectedBooking.status),
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {selectedBooking.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailGroup}>
                  <View style={styles.detailRow}>
                    <Ionicons name="paw-outline" size={24} color="#6B46C1" />
                    <Text style={styles.detailLabel}>Pet:</Text>
                    <Text style={styles.detailText}>
                      {selectedBooking.pet?.name || "Unknown Pet"}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="business-outline"
                      size={24}
                      color="#6B46C1"
                    />
                    <Text style={styles.detailLabel}>Hotel:</Text>
                    <Text style={styles.detailText}>
                      {selectedBooking.hotel?.name ||
                        `Hotel ${selectedBooking.hotel_id}`}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailGroup}>
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={24}
                      color="#6B46C1"
                    />
                    <Text style={styles.detailLabel}>Dates:</Text>
                    <Text style={styles.detailText}>
                      {formatDate(selectedBooking.start_date)} -{" "}
                      {formatDate(selectedBooking.end_date)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="resize-outline" size={24} color="#6B46C1" />
                    <Text style={styles.detailLabel}>Size:</Text>
                    <Text style={styles.detailText}>
                      {selectedBooking.pet_size}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="cash-outline" size={24} color="#6B46C1" />
                    <Text style={styles.detailLabel}>Price:</Text>
                    <Text style={styles.detailText}>
                      RM {selectedBooking.total_price}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailGroup}>
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="restaurant-outline"
                      size={24}
                      color="#6B46C1"
                    />
                    <Text style={styles.detailLabel}>Diet:</Text>
                    <Text style={styles.detailText}>
                      {selectedBooking.dietary_needs || "None"}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="medical-outline"
                      size={24}
                      color="#6B46C1"
                    />
                    <Text style={styles.detailLabel}>Medication:</Text>
                    <Text style={styles.detailText}>
                      {selectedBooking.medication_needs || "None"}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailGroup}>
                  <View style={styles.detailRow}>
                    <Ionicons name="call-outline" size={24} color="#6B46C1" />
                    <Text style={styles.detailLabel}>Emergency:</Text>
                    <Text style={styles.detailText}>
                      {selectedBooking.emergency_contact}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={24}
                      color="#6B46C1"
                    />
                    <Text style={styles.detailLabel}>Requests:</Text>
                    <Text style={styles.detailText}>
                      {selectedBooking.special_requests || "None"}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  historyContainer: {
    marginTop: 30,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6B46C1",
    marginBottom: 15,
  },
  showMoreButton: {
    color: "#6B46C1",
    fontSize: 16,
    fontWeight: "bold",
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#6B46C1",
  },
  historyHotelName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6B46C1",
  },
  historyDates: {
    fontSize: 14,
    color: "#718096",
  },
  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(107, 70, 193, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: width * 0.9,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6B46C1",
    marginBottom: 20,
  },
  modalContent: {
    width: "100%",
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  detailGroup: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A5568",
    marginLeft: 10,
    width: 100,
  },
  detailText: {
    fontSize: 16,
    color: "#2D3748",
    flex: 1,
  },
  closeButton: {
    backgroundColor: "#6B46C1",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 20,
    width: "100%",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  noBookingsText: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
  },
});

export default BookingHistory;
