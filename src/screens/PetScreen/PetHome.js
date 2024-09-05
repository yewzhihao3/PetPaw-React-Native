import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
  Animated,
  StyleSheet,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getUserPets } from "../API/apiService";
import Navbar from "../../components/HomeScreen/Navbar";

const PetHome = () => {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const springValues = useRef({}).current;
  const navigation = useNavigation();

  const fetchPets = useCallback(async () => {
    try {
      const fetchedPets = await getUserPets();
      setPets(fetchedPets);
      if (fetchedPets.length > 0) {
        setSelectedPet(fetchedPets[0]);
      }
      // Initialize spring values for each pet
      fetchedPets.forEach((pet) => {
        if (!springValues[pet.id]) {
          springValues[pet.id] = new Animated.Value(1);
        }
      });
    } catch (error) {
      console.error("Error fetching user's pets:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPets();
    }, [fetchPets])
  );

  const handlePetSelection = useCallback(
    (pet) => {
      setSelectedPet(pet);
      const springValue = springValues[pet.id];
      springValue.setValue(1);
      Animated.spring(springValue, {
        toValue: 1.1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start(() => {
        Animated.spring(springValue, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }).start();
      });
    },
    [springValues]
  );

  const renderPetSelector = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={[
          styles.petSelectorItem,
          selectedPet?.id === item.id && styles.selectedPetSelectorItem,
        ]}
        onPress={() => handlePetSelection(item)}
      >
        <Animated.View
          style={[
            {
              transform: [
                { scale: springValues[item.id] || new Animated.Value(1) },
              ],
            },
          ]}
        >
          <Image
            source={{ uri: item.profile_picture }}
            style={[
              styles.petSelectorImage,
              selectedPet?.id === item.id && styles.selectedPetSelectorImage,
            ]}
          />
          <Text
            style={[
              styles.petSelectorName,
              selectedPet?.id === item.id && styles.selectedPetSelectorName,
            ]}
          >
            {item.name}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    ),
    [selectedPet, handlePetSelection, springValues]
  );

  const navigateToPetProfile = useCallback(() => {
    if (selectedPet) {
      navigation.navigate("PetProfile", { petId: selectedPet.id });
    }
  }, [navigation, selectedPet]);

  const calculateAge = useCallback((birthdate) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }, []);

  const InfoItem = useCallback(
    ({ icon, value }) => (
      <View style={styles.infoItem}>
        <Ionicons name={icon} size={20} color="#6d28d9" />
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    ),
    []
  );
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Pets</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.petSelectorContainer}>
        <FlatList
          data={pets}
          renderItem={renderPetSelector}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.petSelectorList}
          contentContainerStyle={styles.petSelectorContent}
        />
      </View>

      <ScrollView style={styles.mainContent}>
        {selectedPet && (
          <View style={styles.selectedPetCard}>
            <TouchableOpacity onPress={navigateToPetProfile}>
              <Image
                source={{ uri: selectedPet.profile_picture }}
                style={styles.selectedPetImage}
              />
            </TouchableOpacity>
            <View style={styles.selectedPetInfo}>
              <Text style={styles.selectedPetName}>{selectedPet.name}</Text>
              <View style={styles.selectedPetDetails}>
                <InfoItem icon="male-female" value={selectedPet.sex} />
                <InfoItem
                  icon="calendar"
                  value={`${calculateAge(selectedPet.birthdate)} years old`}
                />
                <InfoItem icon="paw" value={selectedPet.breed} />
                <InfoItem icon="scale" value={`${selectedPet.weight} kg`} />
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.petBlogButton}>
          <Text style={styles.petBlogButtonText}>Pet Blog</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="medical" size={24} color="#3B82F6" />
          <Text style={styles.menuItemText}>Medical Records</Text>
          <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            if (selectedPet) {
              console.log(
                "Navigating to PetPrescriptions with petId:",
                selectedPet.id
              );
              navigation.navigate("PetPrescriptions", {
                petId: selectedPet.id,
              });
            } else {
              console.log("No pet selected");
              Alert.alert("No Pet Selected", "Please select a pet first.");
            }
          }}
        >
          <Ionicons name="medical" size={24} color="#6d28d9" />
          <Text style={styles.menuItemText}>Prescriptions</Text>
          <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddPet")}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
      <Navbar />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#6d28d9",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    flex: 1,
    textAlign: "center",
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  settingsButton: {
    padding: 8,
  },
  container: {
    flex: 1,
  },

  // PetHome styles
  petSelectorContainer: {
    backgroundColor: "white",
    paddingBottom: 2,
  },
  petSelectorList: {
    paddingVertical: 10,
  },
  petSelectorContent: {
    paddingHorizontal: 16,
  },
  petSelectorItem: {
    alignItems: "center",
    marginRight: 20,
    padding: 5,
  },
  selectedPetSelectorItem: {
    borderColor: "#6d28d9",
    borderWidth: 2,
    borderRadius: 10,
  },
  petSelectorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
  },
  selectedPetSelectorImage: {
    borderColor: "#6d28d9",
    borderWidth: 2,
  },
  petSelectorName: {
    fontSize: 12,
    color: "#4B5563",
    textAlign: "center",
  },
  selectedPetSelectorName: {
    color: "#6d28d9",
    fontWeight: "bold",
    textAlign: "center",
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  selectedPetCard: {
    backgroundColor: "white",
    borderRadius: 16,
    margin: 16,
    marginTop: 8,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#0000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 3,
    borderColor: "#6d28d9",
  },
  selectedPetImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  selectedPetInfo: {
    padding: 16,
    paddingTop: 12,
  },
  selectedPetName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  selectedPetDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  infoItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },
  petBlogButton: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 16,
    borderWidth: 2,
    borderColor: "#6d28d9",
  },
  petBlogButtonText: {
    color: "#6d28d9",
    fontSize: 16,
    fontWeight: "bold",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    marginBottom: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: "#111827",
    flex: 1,
    marginLeft: 16,
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 120,
    backgroundColor: "#6d28d9",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  // PetCard styles (used in PetHome)
  petCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  petInfo: {
    flex: 1,
    justifyContent: "center",
  },
  petName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  petDetails: {
    fontSize: 14,
    color: "#6B7280",
  },

  formContainer: {
    padding: 16,
    backgroundColor: "white",
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  submitButton: {
    backgroundColor: "#6d28d9",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default PetHome;
