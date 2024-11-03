import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import {
  getPetById,
  updatePetImage,
  getDiet,
  createOrUpdateDiet,
  deleteDiet,
} from "./PapiService";
import AddEditDietModal from "./AddEditDietModal";

const { width } = Dimensions.get("window");

const PetProfile = () => {
  const [pet, setPet] = useState(null);
  const [diet, setDiet] = useState(null);
  const [isDietModalVisible, setIsDietModalVisible] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { petId } = route.params;

  useFocusEffect(
    useCallback(() => {
      fetchPetDetails();
      fetchDietDetails();
    }, [petId])
  );

  const fetchPetDetails = async () => {
    try {
      const petData = await getPetById(petId);
      setPet(petData);
    } catch (error) {
      console.error("Error fetching pet details:", error);
      Alert.alert("Error", "Failed to load pet details. Please try again.");
    }
  };

  const fetchDietDetails = async () => {
    try {
      const dietData = await getDiet(petId);
      setDiet(dietData);
    } catch (error) {
      console.error("Error fetching diet details:", error);
    }
  };

  const handleUpdateImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "You need to allow access to your photos to update the profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      try {
        console.log("Selected image URI:", result.assets[0].uri);
        console.log("Attempting to update pet image for pet ID:", petId);
        const updatedPet = await updatePetImage(petId, result.assets[0].uri);
        console.log("Updated pet data:", updatedPet);
        setPet(updatedPet);
        Alert.alert("Success", "Profile picture updated successfully!");
      } catch (error) {
        console.error("Error updating pet image:", error);
        Alert.alert(
          "Error",
          "Failed to update profile picture. Please try again."
        );
      }
    }
  };

  const handleDietSave = async (dietData) => {
    try {
      await createOrUpdateDiet(petId, dietData);
      fetchDietDetails();
      setIsDietModalVisible(false);
      Alert.alert("Success", "Diet information saved successfully!");
    } catch (error) {
      console.error("Error saving diet:", error);
      Alert.alert(
        "Error",
        "Failed to save diet information. Please try again."
      );
    }
  };

  const handleDeleteDiet = async () => {
    Alert.alert(
      "Delete Diet",
      "Are you sure you want to delete this diet information?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDiet(petId);
              setDiet(null);
              Alert.alert("Success", "Diet information deleted successfully!");
            } catch (error) {
              console.error("Error deleting diet:", error);
              Alert.alert(
                "Error",
                "Failed to delete diet information. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  if (!pet) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const InfoItem = ({ icon, label, value }) => (
    <View style={styles.infoItem}>
      <Ionicons name={icon} size={24} color="#6d28d9" />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const renderDietSection = () => (
    <View style={styles.infoSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Diet Information</Text>
        <View style={styles.dietButtons}>
          <TouchableOpacity
            style={styles.editDietButton}
            onPress={() => setIsDietModalVisible(true)}
          >
            <Ionicons
              name={diet ? "create-outline" : "add-circle-outline"}
              size={24}
              color="#6d28d9"
            />
          </TouchableOpacity>
          {diet && (
            <TouchableOpacity
              style={styles.deleteDietButton}
              onPress={handleDeleteDiet}
            >
              <Ionicons name="trash-outline" size={24} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {diet ? (
        <View style={styles.dietInfo}>
          <InfoItem icon="nutrition" label="Food" value={diet.food} />
          {diet.schedule && (
            <InfoItem icon="time" label="Schedule" value={diet.schedule} />
          )}
          {diet.amount && (
            <InfoItem icon="scale" label="Amount" value={diet.amount} />
          )}
          {diet.notes && (
            <InfoItem icon="document-text" label="Notes" value={diet.notes} />
          )}
        </View>
      ) : (
        <Text style={styles.noDietText}>No diet information added yet</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.navigate("PetHome", { selectedPetId: petId })
          }
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{pet.name}'s Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate("EditPetProfile", { petId: pet.id })
          }
        >
          <Ionicons name="create-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={styles.imageContainer}>
          <Image source={{ uri: pet.profile_picture }} style={styles.image} />
          <TouchableOpacity
            style={styles.updateImageButton}
            onPress={handleUpdateImage}
          >
            <Ionicons name="camera" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Basic Info</Text>
          <View style={styles.infoGrid}>
            <InfoItem icon="paw" label="Name" value={pet.name} />
            <InfoItem icon="fish" label="Species" value={pet.species} />
            <InfoItem icon="ribbon" label="Breed" value={pet.breed} />
            <InfoItem icon="male-female" label="Sex" value={pet.sex} />
            <InfoItem
              icon="calendar"
              label="Birthdate"
              value={new Date(pet.birthdate).toLocaleDateString()}
            />
            <InfoItem icon="scale" label="Weight" value={`${pet.weight} kg`} />
          </View>
        </View>

        {renderDietSection()}
      </ScrollView>

      <AddEditDietModal
        isVisible={isDietModalVisible}
        onClose={() => setIsDietModalVisible(false)}
        onSave={handleDietSave}
        initialDiet={diet}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#6d28d9",
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },
  backButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
  },
  imageContainer: {
    width: width,
    height: width * 0.75,
    position: "relative",
    backgroundColor: "#E5E7EB",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  updateImageButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
  },
  infoSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    borderWidth: 2,
    borderColor: "#6d28d9",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6d28d9",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  infoItem: {
    width: "48%",
    marginBottom: 16,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginTop: 4,
    textAlign: "center",
  },
  dietButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  editDietButton: {
    padding: 4,
    marginRight: 8,
  },
  deleteDietButton: {
    padding: 4,
  },
  dietInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  noDietText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    paddingVertical: 12,
  },
});

export default PetProfile;
