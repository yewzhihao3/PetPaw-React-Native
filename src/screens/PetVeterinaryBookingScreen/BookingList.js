import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getUserAppointments, getUserPets, getServices } from "./PVapiService";

const { height } = Dimensions.get("window");

const BookingList = () => {
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState({});
  const [services, setServices] = useState({}); // Add this line
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const navigation = useNavigation();
  const slideAnimation = useRef(new Animated.Value(height)).current;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [fetchedAppointments, fetchedPets, fetchedServices] =
        await Promise.all([
          getUserAppointments(),
          getUserPets(),
          getServices(),
        ]);

      const petsMap = fetchedPets.reduce((acc, pet) => {
        acc[pet.id] = pet.name;
        return acc;
      }, {});

      const servicesMap = fetchedServices.reduce((acc, service) => {
        acc[service.id] = service.name;
        return acc;
      }, {});

      setPets(petsMap);
      setServices(servicesMap);
      setAppointments(fetchedAppointments);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load appointments. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const openModal = (appointment) => {
    setSelectedAppointment(appointment);
    setModalVisible(true);
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnimation, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedAppointment(null);
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "SCHEDULED":
        return "#3B82F6"; // Blue
      case "CONFIRMED":
        return "#10B981"; // Green
      case "IN_PROGRESS":
        return "#F59E0B"; // Amber
      case "COMPLETED":
        return "#6D28D9"; // Purple
      case "CANCELLED":
        return "#EF4444"; // Red
      default:
        return "#6B7280"; // Gray (default color)
    }
  };

  const renderAppointmentItem = ({ item }) => {
    const petName = item.pet_id
      ? pets[item.pet_id] || `Pet #${item.pet_id}`
      : item.other_pet_species || "Unknown Pet";
    const serviceName =
      services[item.service_id] || `Service #${item.service_id}`;
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.appointmentItem}
        onPress={() => openModal(item)}
      >
        <View style={styles.appointmentHeader}>
          <Text style={styles.petName}>{petName}</Text>
          <View
            style={[styles.statusContainer, { backgroundColor: statusColor }]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.service}>{serviceName}</Text>
        <Text style={styles.dateTime}>
          {new Date(item.date_time).toLocaleDateString()} at{" "}
          {new Date(item.date_time).toLocaleTimeString()}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ translateY: slideAnimation }],
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Appointment Details</Text>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          {selectedAppointment && (
            <View style={styles.modalBody}>
              <View style={styles.modalRow}>
                <Ionicons name="paw" size={24} color="#6d28d9" />
                <Text style={styles.modalText}>
                  {selectedAppointment.pet_id
                    ? pets[selectedAppointment.pet_id] ||
                      `Pet #${selectedAppointment.pet_id}`
                    : selectedAppointment.other_pet_species || "Unknown Pet"}
                </Text>
              </View>
              {selectedAppointment.other_pet_breed && (
                <View style={styles.modalRow}>
                  <Ionicons
                    name="information-circle"
                    size={24}
                    color="#6d28d9"
                  />
                  <Text style={styles.modalText}>
                    Breed: {selectedAppointment.other_pet_breed}
                  </Text>
                </View>
              )}
              <View style={styles.modalRow}>
                <Ionicons name="medkit" size={24} color="#6d28d9" />
                <Text style={styles.modalText}>
                  {services[selectedAppointment.service_id] ||
                    `Service #${selectedAppointment.service_id}`}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Ionicons name="calendar" size={24} color="#6d28d9" />
                <Text style={styles.modalText}>
                  {new Date(selectedAppointment.date_time).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Ionicons name="time" size={24} color="#6d28d9" />
                <Text style={styles.modalText}>
                  {new Date(selectedAppointment.date_time).toLocaleTimeString()}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Ionicons
                  name="bookmark"
                  size={24}
                  color={getStatusColor(selectedAppointment.status)}
                />
                <Text
                  style={[
                    styles.modalText,
                    { color: getStatusColor(selectedAppointment.status) },
                  ]}
                >
                  Status: {selectedAppointment.status}
                </Text>
              </View>
              {selectedAppointment.notes && (
                <View style={styles.modalRow}>
                  <Ionicons name="create" size={24} color="#6d28d9" />
                  <Text style={styles.modalText}>
                    Notes: {selectedAppointment.notes}
                  </Text>
                </View>
              )}
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6d28d9" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#6d28d9" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={styles.headerRight} />
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      {appointments.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.noAppointmentsText}>No appointments found.</Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointmentItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
      {renderModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#6d28d9",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  headerRight: {
    width: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
  },
  appointmentItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  petName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6d28d9",
  },
  statusContainer: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  service: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 4,
    fontWeight: "bold",
  },
  dateTime: {
    fontSize: 14,
    color: "#6B7280",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    width: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#6d28d9",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    padding: 20,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    color: "#4B5563",
    marginLeft: 12,
    flex: 1,
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
  },
  noAppointmentsText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});

export default BookingList;
