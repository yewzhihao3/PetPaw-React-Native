import React, { useState, useEffect } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getPrescriptionsByPetId,
  createRefillRequest,
} from "../API/apiService";

const StatusIndicator = ({ status }) => {
  let color;
  switch (status) {
    case "PENDING":
      color = "#FFA500"; // Yellow
      break;
    case "APPROVED":
      color = "#4CAF50"; // Green
      break;
    case "DENIED":
      color = "#FF0000"; // Red
      break;
    default:
      color = "#808080"; // Gray for unknown status
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
}) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={isVisible}
    onRequestClose={onClose}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{prescription?.medication_name}</Text>
        <Text style={styles.modalSubtitle}>Dosage: {prescription?.dosage}</Text>
        <Text style={styles.modalText}>
          Instructions: {prescription?.instructions}
        </Text>
        <Text style={styles.modalText}>
          Veterinarian: {prescription?.veterinarian}
        </Text>
        <Text style={styles.modalText}>
          Start Date: {prescription?.start_date}
        </Text>
        <Text style={styles.modalText}>End Date: {prescription?.end_date}</Text>

        {prescription?.refill_requests &&
          prescription.refill_requests.length > 0 && (
            <View style={styles.refillHistoryContainer}>
              <Text style={styles.refillHistoryTitle}>Refill History:</Text>
              {prescription.refill_requests.map((request, index) => (
                <View key={index} style={styles.refillHistoryItem}>
                  <StatusIndicator status={request.status} />
                  <Text style={styles.refillHistoryDate}>
                    {new Date(request.created_at).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          )}

        {prescription?.refill_status === "refillable" && (
          <TouchableOpacity
            style={styles.refillButton}
            onPress={() => onRefillRequest(prescription.id)}
          >
            <Text style={styles.refillButtonText}>Request Refill</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const PetPrescription = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { petId } = route.params;
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, [petId]);

  const fetchPrescriptions = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const fetchedPrescriptions = await getPrescriptionsByPetId(petId, token);
      setPrescriptions(fetchedPrescriptions);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch prescriptions:", error);
      Alert.alert("Error", "Failed to fetch prescriptions. Please try again.");
      setLoading(false);
    }
  };

  const handleRefillRequest = async (prescriptionId) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      await createRefillRequest(prescriptionId, token);
      Alert.alert("Success", "Refill request sent successfully!");
      setModalVisible(false);
      fetchPrescriptions();
    } catch (error) {
      console.error("Failed to create refill request:", error);
      Alert.alert("Error", "Failed to send refill request. Please try again.");
    }
  };

  const openModal = (prescription) => {
    setSelectedPrescription(prescription);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
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
              No prescriptions found for this pet.
            </Text>
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
    backgroundColor: "#6200EE",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
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
    maxHeight: "80%",
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
  modalText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  refillHistoryContainer: {
    marginTop: 16,
  },
  refillHistoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6200EE",
    marginBottom: 8,
  },
  refillHistoryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  refillHistoryDate: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
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
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 16,
  },
  closeButtonText: {
    color: "#333",
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
});

export default PetPrescription;
