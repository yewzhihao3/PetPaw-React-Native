import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  getUpcomingMedicalRecordExpirations,
  getUserPets,
  getServices,
} from "../API/apiService";

const serviceIcons = {
  "Annual Check-up": "medical-outline",
  Vaccination: "fitness-outline",
  "Dental Cleaning": "brush-outline",
  Microchipping: "pricetag-outline",
  "Spay/Neuter": "cut-outline",
  "X-Ray": "scan-outline",
};

const VetHome = () => {
  const navigation = useNavigation();
  const [expiredMedicalRecords, setExpiredMedicalRecords] = useState([]);
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [medicalRecords, userPets, fetchedServices] = await Promise.all([
        getUpcomingMedicalRecordExpirations(),
        getUserPets(),
        getServices(),
      ]);

      const currentDate = new Date();
      const expiredRecords = medicalRecords
        .filter((record) => new Date(record.expiration_date) < currentDate)
        .sort(
          (a, b) => new Date(b.expiration_date) - new Date(a.expiration_date)
        )
        .slice(0, 5);

      setExpiredMedicalRecords(expiredRecords);
      setPets(userPets);
      setServices(fetchedServices);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("An error occurred while fetching data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderMedicalRecordCard = (record) => {
    return (
      <TouchableOpacity
        key={record.id}
        style={styles.card}
        onPress={() =>
          navigation.navigate("BookAppointment", {
            selectedPetId: record.pet_id,
            selectedPetName: record.pet_name,
          })
        }
      >
        <View style={styles.cardContent}>
          <Text style={styles.petName}>{record.pet_name}</Text>
          <Text style={styles.recordType}>{record.description}</Text>
          <Text style={[styles.expirationDate, { color: "#EF4444" }]}>
            Expired: {new Date(record.expiration_date).toLocaleDateString()}
          </Text>
        </View>
        <Ionicons name="alert-circle" size={24} color="#EF4444" />
      </TouchableOpacity>
    );
  };

  const renderFeaturedService = ({ item }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() =>
        navigation.navigate("BookAppointment", { selectedServiceId: item.id })
      }
    >
      <View style={styles.serviceIconContainer}>
        <Ionicons
          name={serviceIcons[item.name] || "help-circle-outline"}
          size={24}
          color="#6d28d9"
        />
      </View>
      <Text style={styles.serviceName}>{item.name}</Text>
      <View style={styles.serviceDetails}>
        <Text style={styles.serviceDuration}>{item.duration} min</Text>
        <Text style={styles.servicePrice}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderPetCard = (pet) => (
    <TouchableOpacity
      key={pet.id}
      style={styles.petCard}
      onPress={() => navigation.navigate("PetProfile", { petId: pet.id })}
    >
      {pet.profile_picture && (
        <Image source={{ uri: pet.profile_picture }} style={styles.petImage} />
      )}
      <View style={styles.petInfo}>
        <Text style={styles.petName}>{pet.name}</Text>
        <Text style={styles.petBreed}>
          {pet.species} - {pet.breed}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6d28d9" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vet Appointments</Text>
        <View style={styles.placeholderView} />
      </View>
      <ScrollView style={styles.scrollView}>
        <TouchableOpacity
          style={styles.bookAppointmentButton}
          onPress={() => navigation.navigate("BookAppointment")}
        >
          <Text style={styles.bookAppointmentText}>Book New Appointment</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expired Medical Records</Text>
          {expiredMedicalRecords.length > 0 ? (
            expiredMedicalRecords.map(renderMedicalRecordCard)
          ) : (
            <Text style={styles.noDataText}>No expired medical records</Text>
          )}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Services</Text>
          <FlatList
            data={services}
            renderItem={renderFeaturedService}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Pets</Text>
          {pets.length > 0 ? (
            pets.map(renderPetCard)
          ) : (
            <Text style={styles.noDataText}>No pets found</Text>
          )}
        </View>
      </ScrollView>
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
    backgroundColor: "#6d28d9",
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    flex: 1,
    textAlign: "center",
  },
  placeholderView: {
    width: 40,
  },
  scrollView: {
    padding: 16,
  },
  bookAppointmentButton: {
    backgroundColor: "#6d28d9",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  bookAppointmentText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#111827",
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  recordType: {
    fontSize: 16,
    color: "#6B7280",
  },
  expirationDate: {
    fontSize: 14,
    fontWeight: "bold",
  },
  serviceCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    width: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
    justifyContent: "space-between",
    height: 180,
  },
  serviceIconContainer: {
    backgroundColor: "#F3E8FF",
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
    height: 40,
  },
  serviceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
  },
  serviceDuration: {
    fontSize: 14,
    color: "#6B7280",
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#10B981",
  },
  petCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  petInfo: {
    flex: 1,
  },
  petBreed: {
    fontSize: 14,
    color: "#6B7280",
  },
  noDataText: {
    fontSize: 16,
    color: "#6B7280",
    fontStyle: "italic",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#6d28d9",
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default VetHome;
