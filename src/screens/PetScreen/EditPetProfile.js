import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getPetById, updatePet } from "../API/apiService";
import styles from "../../../theme/PetTheme";

const EditPetProfile = () => {
  const [pet, setPet] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    sex: "",
    birthdate: "",
    weight: "",
    diet: "",
  });

  const navigation = useNavigation();
  const route = useRoute();
  const { petId } = route.params;

  useEffect(() => {
    fetchPetDetails();
  }, [petId]);

  const fetchPetDetails = async () => {
    try {
      const petData = await getPetById(petId);
      setPet(petData);
      setFormData({
        name: petData.name,
        species: petData.species,
        breed: petData.breed,
        sex: petData.sex,
        birthdate: new Date(petData.birthdate).toISOString().split("T")[0],
        weight: petData.weight.toString(),
        diet: petData.diet?.food || "",
      });
    } catch (error) {
      console.error("Error fetching pet details:", error);
      Alert.alert("Error", "Failed to load pet details. Please try again.");
    }
  };

  const handleInputChange = useCallback((field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  }, []);

  const handleUpdatePet = useCallback(async () => {
    try {
      const updatedPetData = {
        ...formData,
        weight: parseFloat(formData.weight),
        diet: { food: formData.diet },
      };
      console.log(
        "Sending updated pet data:",
        JSON.stringify(updatedPetData, null, 2)
      );

      const updatedPet = await updatePet(petId, updatedPetData);
      console.log(
        "Received updated pet data:",
        JSON.stringify(updatedPet, null, 2)
      );
      Alert.alert("Success", "Pet profile updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating pet profile:", error);
      Alert.alert("Error", "Failed to update pet profile. Please try again.");
    }
  }, [formData, petId, navigation]);

  const InputField = useCallback(
    ({ label, field, value, placeholder, keyboardType }) => (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => handleInputChange(field, text)}
          placeholder={placeholder}
          keyboardType={keyboardType}
        />
      </View>
    ),
    [handleInputChange]
  );

  const inputFields = useMemo(
    () => [
      { label: "Name", field: "name", placeholder: "Pet's name" },
      { label: "Species", field: "species", placeholder: "Species" },
      { label: "Breed", field: "breed", placeholder: "Breed" },
      { label: "Sex", field: "sex", placeholder: "Sex" },
      { label: "Birthdate", field: "birthdate", placeholder: "YYYY-MM-DD" },
      {
        label: "Weight (lbs)",
        field: "weight",
        placeholder: "Weight",
        keyboardType: "numeric",
      },
      { label: "Diet", field: "diet", placeholder: "Diet" },
    ],
    []
  );

  if (!pet) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#6d28d9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Pet Profile</Text>
        <TouchableOpacity onPress={handleUpdatePet}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.formContainer}>
        {inputFields.map(({ label, field, placeholder, keyboardType }) => (
          <InputField
            key={field}
            label={label}
            field={field}
            value={formData[field]}
            placeholder={placeholder}
            keyboardType={keyboardType}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditPetProfile;
