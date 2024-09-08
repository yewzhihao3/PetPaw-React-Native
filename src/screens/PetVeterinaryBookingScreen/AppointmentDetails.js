import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

const AppointmentDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { appointmentId } = route.params;
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    // Fetch appointment details from your API
    // For now, we'll use dummy data
    setAppointment({
      id: appointmentId,
      petName: "Max",
      petSpecies: "Dog",
      petBreed: "Labrador",
      type: "Annual Check-up",
      date: "2023-06-15",
      time: "10:00 AM",
      veterinarian: "Dr. Smith",
      notes: "Please bring vaccination records.",
      status: "Confirmed",
    });
  }, [appointmentId]);

  const handleReschedule = () => {
    // Navigate to a reschedule screen or show a date/time picker
    Alert.alert("Reschedule", "Navigate to reschedule screen");
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: () => {
            // Call API to cancel appointment
            Alert.alert(
              "Appointment Cancelled",
              "Your appointment has been cancelled."
            );
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!appointment) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#6d28d9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointment Details</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{appointment.type}</Text>
        <Text style={styles.cardSubtitle}>
          {appointment.date} at {appointment.time}
        </Text>
        <Text style={styles.status}>{appointment.status}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Pet Information</Text>
        <Text style={styles.infoText}>{appointment.petName}</Text>
        <Text style={styles.infoText}>
          {appointment.petSpecies} - {appointment.petBreed}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Veterinarian</Text>
        <Text style={styles.infoText}>{appointment.veterinarian}</Text>
      </View>

      {appointment.notes && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.infoText}>{appointment.notes}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleReschedule}>
          <Text style={styles.buttonText}>Reschedule</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
        >
          <Text style={[styles.buttonText, styles.cancelButtonText]}>
            Cancel Appointment
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
    color: "#111827",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  cardSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#10B981",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 4,
  },
  buttonContainer: {
    margin: 16,
  },
  button: {
    backgroundColor: "#6d28d9",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  cancelButtonText: {
    color: "#EF4444",
  },
});

export default AppointmentDetails;
