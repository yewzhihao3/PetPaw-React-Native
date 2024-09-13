import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPrescriptionsByPetId, createRefillRequest } from "./PapiService";

const StatusIndicator = ({ status }) => {
  let color;
  switch (status) {
    case "PENDING":
      color = "#FFA500";
      break;
    case "APPROVED":
      color = "#4CAF50";
      break;
    case "DENIED":
      color = "#FF0000";
      break;
    default:
      color = "#808080";
  }

  return (
    <View style={[styles.statusIndicator, { backgroundColor: color }]}>
      <Text style={styles.statusText}>{status}</Text>
    </View>
  );
};

const PrescriptionCard = ({ prescription, onPress }) => (
  <TouchableOpacity style={styles.prescriptionCard} onPress={onPress}>
    <View style={styles.prescriptionHeader}>
      <Text style={styles.medicationName}>{prescription.medication_name}</Text>
      <Text
        style={[
          styles.refillableText,
          {
            color:
              prescription.refill_status === "refillable"
                ? "#6200EE"
                : "#58a3de",
          },
        ]}
      >
        {prescription.refill_status === "refillable"
          ? "Refillable"
          : "Not Refillable"}
      </Text>
    </View>
    <Text style={styles.dosage}>{prescription.dosage}</Text>
    <Text style={styles.instructions} numberOfLines={2}>
      {prescription.instructions}
    </Text>
  </TouchableOpacity>
);

const PrescriptionDetailModal = ({
  isVisible,
  prescription,
  onClose,
  onRefillRequest,
}) => {
  const [showAllHistory, setShowAllHistory] = useState(false);

  if (!prescription) return null;

  const hasPendingRequest = prescription.refill_requests?.some(
    (request) => request.status === "PENDING"
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const sortedRefillRequests =
    prescription.refill_requests?.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    ) || [];

  const displayedRefillRequests = showAllHistory
    ? sortedRefillRequests
    : sortedRefillRequests.slice(0, 2);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.modalTitle}>
              {prescription.medication_name}
            </Text>
            <Text style={styles.modalSubtitle}>
              Dosage: {prescription.dosage}
            </Text>
            <View style={styles.infoGroup}>
              <Text style={styles.infoLabel}>Instructions:</Text>
              <Text style={styles.infoText}>{prescription.instructions}</Text>
            </View>
            <View style={styles.infoGroup}>
              <Text style={styles.infoLabel}>Veterinarian:</Text>
              <Text style={styles.infoText}>
                {prescription.veterinarian
                  ? prescription.veterinarian.name
                  : "N/A"}
              </Text>
            </View>
            <View style={styles.dateGroup}>
              <View style={styles.dateItem}>
                <Ionicons name="calendar-outline" size={18} color="#6200EE" />
                <Text style={styles.dateText}>
                  Start: {formatDate(prescription.start_date)}
                </Text>
              </View>
              <View style={styles.dateItem}>
                <Ionicons name="calendar-outline" size={18} color="#6200EE" />
                <Text style={styles.dateText}>
                  End: {formatDate(prescription.end_date)}
                </Text>
              </View>
            </View>

            <View style={styles.refillHistoryContainer}>
              <View style={styles.refillHistoryHeader}>
                <Text style={styles.refillHistoryTitle}>Refill History:</Text>
                {sortedRefillRequests.length > 2 && (
                  <TouchableOpacity
                    onPress={() => setShowAllHistory(!showAllHistory)}
                  >
                    <Text style={styles.viewMoreButton}>
                      {showAllHistory ? "Show Less" : "View More"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {sortedRefillRequests.length > 0 ? (
                <ScrollView style={styles.refillHistoryScroll}>
                  {displayedRefillRequests.map((request, index) => (
                    <View key={index}>
                      <View style={styles.refillHistoryItem}>
                        <StatusIndicator status={request.status} />
                        <View style={styles.refillHistoryInfo}>
                          <View style={styles.refillHistoryRow}>
                            <Text style={styles.refillHistoryDate}>
                              Requested on: {formatDate(request.created_at)}
                            </Text>
                            <Text style={styles.refillHistoryStatus}>
                              {request.status}
                            </Text>
                          </View>
                        </View>
                      </View>
                      {index < displayedRefillRequests.length - 1 && (
                        <View style={styles.separator} />
                      )}
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.noRefillHistoryText}>
                  No refill history available.
                </Text>
              )}
            </View>
          </ScrollView>

          {prescription.refill_status === "refillable" &&
            !hasPendingRequest && (
              <TouchableOpacity
                style={styles.refillButton}
                onPress={() => onRefillRequest(prescription.id)}
              >
                <Text style={styles.refillButtonText}>Request Refill</Text>
              </TouchableOpacity>
            )}

          {hasPendingRequest && (
            <View style={styles.pendingRequestContainer}>
              <Text style={styles.pendingRequestText}>
                A refill request is pending approval.
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const PetPrescription = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { petId, petName } = route.params;
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrescriptions = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      console.log("Fetching prescriptions for petId:", petId);
      const fetchedPrescriptions = await getPrescriptionsByPetId(petId, token);
      console.log("Fetched prescriptions:", fetchedPrescriptions);
      setPrescriptions(fetchedPrescriptions);
    } catch (error) {
      console.error("Failed to fetch prescriptions:", error);
      setError("Failed to fetch prescriptions. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [petId]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const handleRefillRequest = async (prescriptionId) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      await createRefillRequest(prescriptionId, token);
      Alert.alert("Success", "Refill request sent successfully!");
      setModalVisible(false);
      fetchPrescriptions(); // Refresh the prescriptions after a successful refill request
    } catch (error) {
      console.error("Failed to create refill request:", error);
      Alert.alert("Error", "Failed to send refill request. Please try again.");
    }
  };

  const openModal = (prescription) => {
    setSelectedPrescription(prescription);
    setModalVisible(true);
  };

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchPrescriptions}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("PetHome", { selectedPetId: petId })
          }
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prescriptions</Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EE" />
        </View>
      ) : (
        <FlatList
          data={prescriptions}
          renderItem={({ item }) => (
            <PrescriptionCard
              prescription={item}
              onPress={() => openModal(item)}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.prescriptionList}
          ListEmptyComponent={
            <Text style={styles.noPrescriptionsText}>
              No prescriptions found for {petName}.
            </Text>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
      <PrescriptionDetailModal
        isVisible={modalVisible}
        prescription={selectedPrescription}
        onClose={() => setModalVisible(false)}
        onRefillRequest={handleRefillRequest}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#6200EE",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerLeft: {
    width: 24,
  },
  headerRight: {
    width: 24,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },

  prescriptionList: {
    padding: 16,
  },
  prescriptionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  prescriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  refillableText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  dosage: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  instructions: {
    fontSize: 14,
    color: "#666",
  },
  statusIndicator: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%", // Increased from 70% to give more space
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6200EE",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 16,
  },
  infoGroup: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    color: "#666",
  },
  expandableText: {
    fontSize: 16,
    color: "#666",
  },
  expandButton: {
    color: "#6200EE",
    fontWeight: "bold",
    marginTop: 4,
  },
  dateGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  refillHistoryContainer: {
    marginTop: 16,
    maxHeight: 200, // Set a max height for the refill history section
  },
  refillHistoryScroll: {
    maxHeight: 150, // Adjust this value as needed
  },
  refillHistoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  refillHistoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6200EE",
    marginBottom: 8,
  },
  viewMoreButton: {
    color: "#6200EE",
    fontSize: 14,
    fontWeight: "bold",
  },
  refillHistoryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  refillHistoryInfo: {
    flex: 1,
    marginLeft: 8,
  },
  refillHistoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  refillHistoryDate: {
    fontSize: 14,
    color: "#666",
  },
  refillHistoryStatus: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 8,
  },
  refillButton: {
    backgroundColor: "#6200EE",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 16,
  },
  refillButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#6200EE",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 16,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noPrescriptionsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  pendingRequestContainer: {
    backgroundColor: "#FFF9C4",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  pendingRequestText: {
    color: "#F57F17",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF0000",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#6200EE",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
  },
  noRefillHistoryText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
  },
});
export default PetPrescription;
