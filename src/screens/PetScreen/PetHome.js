import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getPets } from "../API/apiService";
import styles from "../../../theme/PetTheme";

const PetHome = () => {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const fetchedPets = await getPets();
      setPets(fetchedPets);
      if (fetchedPets.length > 0) {
        setSelectedPet(fetchedPets[0]);
      }
    } catch (error) {
      console.error("Error fetching pets:", error);
    }
  };

  const renderPetSelector = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.petSelectorItem,
        selectedPet?.id === item.id && styles.selectedPetSelectorItem,
      ]}
      onPress={() => setSelectedPet(item)}
    >
      <Image
        source={{ uri: item.profile_picture }}
        style={styles.petSelectorImage}
      />
      <Text style={styles.petSelectorName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const navigateToPetProfile = () => {
    if (selectedPet) {
      navigation.navigate("PetProfile", { petId: selectedPet.id });
    }
  };

  const calculateAge = (birthdate) => {
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
  };

  const InfoItem = ({ icon, value }) => (
    <View style={styles.infoItem}>
      <Ionicons name={icon} size={20} color="#6d28d9" />
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
        <Text style={styles.headerTitle}>Pets</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="white" />
        </TouchableOpacity>
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
                <InfoItem icon="scale" value={`${selectedPet.weight} lbs`} />
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="medical" size={24} color="#3B82F6" />
          <Text style={styles.menuItemText}>Medical Records</Text>
          <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="document-text" size={24} color="#8B5CF6" />
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
    </SafeAreaView>
  );
};

export default PetHome;
