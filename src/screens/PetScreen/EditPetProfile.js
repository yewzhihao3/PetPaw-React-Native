import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Modal,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getPetById, updatePet } from "./PapiService";
import { animalData } from "../../components/PetScreenComp/mockdata";

const EditPetProfile = () => {
  const [pet, setPet] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    sex: "",
    birthdate: new Date(),
    weight: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
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
        birthdate: new Date(petData.birthdate),
        weight: petData.weight.toString(),
      });
      setTempDate(new Date(petData.birthdate));
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

  const handleDateChange = (event, selectedDate) => {
    setTempDate(selectedDate || tempDate);
  };

  const confirmDate = () => {
    handleInputChange("birthdate", tempDate);
    setShowDatePicker(false);
  };

  const handleUpdatePet = useCallback(async () => {
    try {
      const updatedPetData = {
        ...formData,
        weight: parseFloat(formData.weight),
        birthdate: formData.birthdate.toISOString().split("T")[0],
      };
      const updatedPet = await updatePet(petId, updatedPetData);
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
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Pet Profile</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.formContainer}>
        <InputField
          label="Name"
          field="name"
          value={formData.name}
          placeholder="Pet's name"
        />
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Species</Text>
          <RNPickerSelect
            onValueChange={(value) => handleInputChange("species", value)}
            items={animalData.species}
            style={pickerSelectStyles}
            value={formData.species}
            placeholder={{ label: "Select species", value: null }}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Breed</Text>
          <RNPickerSelect
            onValueChange={(value) => handleInputChange("breed", value)}
            items={animalData.breeds[formData.species] || []}
            style={pickerSelectStyles}
            value={formData.breed}
            placeholder={{ label: "Select breed", value: null }}
            disabled={!formData.species}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Sex</Text>
          <RNPickerSelect
            onValueChange={(value) => handleInputChange("sex", value)}
            items={[
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" },
            ]}
            style={pickerSelectStyles}
            value={formData.sex}
            placeholder={{ label: "Select sex", value: null }}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Birthdate</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.datePickerButton}
          >
            <Text style={styles.datePickerButtonText}>
              {formData.birthdate.toDateString()}
            </Text>
          </TouchableOpacity>
        </View>
        <InputField
          label="Weight (kg)"
          field="weight"
          value={formData.weight}
          placeholder="Weight"
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleUpdatePet}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDatePicker}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.dateText}>{tempDate.toDateString()}</Text>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              style={styles.datePicker}
              textColor="#6d28d9"
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonConfirm]}
                onPress={confirmDate}
              >
                <Text style={styles.textStyle}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#6d28d9",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  formContainer: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4c1d95",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#6d28d9",
  },
  datePickerButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#6d28d9",
  },
  datePickerButtonText: {
    fontSize: 16,
    color: "#4c1d95",
  },
  saveButton: {
    backgroundColor: "#6d28d9",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  datePicker: {
    width: 320,
    height: 260,
    backgroundColor: "white",
  },
  dateText: {
    fontSize: 18,
    marginBottom: 20,
    color: "#000000",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    minWidth: 100,
  },
  buttonConfirm: {
    backgroundColor: "#6d28d9",
  },
  buttonCancel: {
    backgroundColor: "#999",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#6d28d9",
    borderRadius: 8,
    color: "black",
    paddingRight: 30,
    backgroundColor: "#fff",
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#6d28d9",
    borderRadius: 8,
    color: "black",
    paddingRight: 30,
    backgroundColor: "#fff",
  },
});

export default EditPetProfile;
