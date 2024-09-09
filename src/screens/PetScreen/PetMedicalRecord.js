import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getMedicalRecordsByPetId } from "./PapiService";

const PetMedicalRecord = ({ route }) => {
  const { petId, petName } = route.params;
  const navigation = useNavigation();
  const [medicalRecords, setMedicalRecords] = useState([]);

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      const records = await getMedicalRecordsByPetId(petId);
      setMedicalRecords(records);
    } catch (error) {
      console.error("Error fetching medical records:", error);
    }
  };

  const getRecordStatus = (expirationDate) => {
    const currentDate = new Date();
    const expDate = new Date(expirationDate);
    const daysUntilExpiration = Math.ceil(
      (expDate - currentDate) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiration <= 0) {
      return { status: "expired", color: "red", icon: "alert-circle" };
    } else if (daysUntilExpiration <= 60) {
      return { status: "expiring soon", color: "orange", icon: "warning" };
    } else {
      return { status: "active", color: "blue", icon: "checkmark-circle" };
    }
  };

  const handleAppointmentRequest = (item) => {
    navigation.navigate("BookAppointment", {
      selectedPetId: petId,
      selectedPetName: petName,
      medicalRecordId: item.id,
      medicalRecordDescription: item.description,
    });
  };

  const renderMedicalRecord = ({ item }) => {
    const { status, color, icon } = getRecordStatus(item.expiration_date);
    const showRequestAppointment =
      status === "expired" || status === "expiring soon";

    return (
      <View style={styles.recordItem}>
        <View style={styles.recordHeader}>
          <Ionicons name="medical-outline" size={24} color="#6d28d9" />
          <Text style={styles.recordName}>{item.description}</Text>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.clinicName}>{item.clinic_name}</Text>
        <Text style={styles.veterinarianName}>
          Veterinarian: {item.veterinarian}
        </Text>
        <Text style={[styles.expiryDate, { color }]}>
          {status === "expired"
            ? "Expired: "
            : status === "expiring soon"
            ? "Expiring soon: "
            : "Expires: "}
          {new Date(item.expiration_date).toLocaleDateString()}
        </Text>
        <Text style={styles.visitDate}>
          Visit Date: {new Date(item.date).toLocaleDateString()}
        </Text>
        {showRequestAppointment && (
          <TouchableOpacity
            style={[
              styles.appointmentButton,
              { backgroundColor: color === "orange" ? "#F59E0B" : "#EF4444" },
            ]}
            onPress={() => handleAppointmentRequest(item)}
          >
            <Text style={styles.appointmentButtonText}>
              {color === "orange" ? "Book in Advance" : "Request Appointment"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical Records</Text>
        <View style={{ width: 24 }} />
      </View>
      <Text style={styles.subHeader}>
        Synced medical records from your provider(s) are included below.{" "}
        {petName}'s records are shown here.
      </Text>
      <FlatList
        data={medicalRecords}
        renderItem={renderMedicalRecord}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No medical records found.</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#6d28d9",
    padding: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  subHeader: {
    padding: 16,
    fontSize: 14,
    color: "#666",
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  recordItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderColor: "#6d28d9",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  recordHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  recordName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#6d28d9",
  },
  clinicName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  veterinarianName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  expiryDate: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "bold",
  },
  visitDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  appointmentButton: {
    backgroundColor: "#6d28d9",
    borderRadius: 4,
    padding: 8,
    alignItems: "center",
    marginTop: 8,
  },
  bookInAdvanceButton: {
    backgroundColor: "#6d28d9",
  },
  appointmentButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
});

export default PetMedicalRecord;
