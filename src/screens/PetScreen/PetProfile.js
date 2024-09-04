import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { getPetById, updatePetImage } from "../API/apiService";
import styles from "../../../theme/PetTheme";

const PetProfile = () => {
  const [pet, setPet] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { petId } = route.params;

  useFocusEffect(
    useCallback(() => {
      fetchPetDetails();
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

  if (!pet) {
    return (
      <View style={styles.petProfileContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const InfoItem = ({ icon, label, value }) => (
    <View style={styles.petProfileInfoItem}>
      <Ionicons name={icon} size={24} color="#6d28d9" />
      <Text style={styles.petProfileInfoLabel}>{label}</Text>
      <Text style={styles.petProfileInfoValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.petProfileContainer}>
      <View style={styles.petProfileHeaderContainer}>
        <TouchableOpacity
          style={styles.petProfileBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.petProfileHeaderTitle}>{pet.name}'s Profile</Text>
        <TouchableOpacity
          style={styles.petProfileEditButton}
          onPress={() =>
            navigation.navigate("EditPetProfile", { petId: pet.id })
          }
        >
          <Ionicons name="create-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View style={styles.petProfileImageContainer}>
          <Image
            source={{ uri: pet.profile_picture }}
            style={styles.petProfileImage}
          />
          <TouchableOpacity
            style={styles.updateImageButton}
            onPress={handleUpdateImage}
          >
            <Ionicons name="camera" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.petProfileInfoSection}>
          <Text style={styles.petProfileSectionTitle}>Basic Info</Text>
          <View style={styles.petProfileInfoGrid}>
            <InfoItem icon="paw" label="Name" value={pet.name} />
            <InfoItem icon="fish" label="Species" value={pet.species} />
            <InfoItem icon="ribbon" label="Breed" value={pet.breed} />
            <InfoItem icon="male-female" label="Sex" value={pet.sex} />
            <InfoItem
              icon="calendar"
              label="Birthdate"
              value={new Date(pet.birthdate).toLocaleDateString()}
            />
            <InfoItem icon="scale" label="Weight" value={`${pet.weight} lbs`} />
          </View>
        </View>
        <View style={styles.petProfileInfoSection}>
          <Text style={styles.petProfileSectionTitle}>Diet</Text>
          <View style={styles.petProfileInfoGrid}>
            <InfoItem
              icon="nutrition"
              label="Food"
              value={pet.diet?.food || "N/A"}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PetProfile;
