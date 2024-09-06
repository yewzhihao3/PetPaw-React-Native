import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  StyleSheet,
  Image,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { createPet } from "../API/apiService";
import { animalData } from "../../components/PetScreenComp/mockdata";

const AddPet = () => {
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
  const [image, setImage] = useState(null);
  const navigation = useNavigation();

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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleAddPet = useCallback(async () => {
    try {
      console.log("Starting pet creation process");
      const petData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "birthdate") {
          // Format the date as DD-MM-YYYY
          const date = formData[key];
          const formattedDate = `${date
            .getDate()
            .toString()
            .padStart(2, "0")}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${date.getFullYear()}`;
          petData.append(key, formattedDate);
        } else if (key === "weight") {
          petData.append(key, parseFloat(formData[key]));
        } else {
          petData.append(key, formData[key]);
        }
      });

      if (image) {
        const uriParts = image.split(".");
        const fileType = uriParts[uriParts.length - 1];

        petData.append("profile_picture", {
          uri: image,
          name: `pet_image.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      console.log("Pet data prepared:", petData);
      const newPet = await createPet(petData);
      console.log("Pet created successfully:", newPet);
      Alert.alert("Success", "Pet added successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error adding pet:", error);
      if (error.response) {
        console.error("Error response:", error.response);
      }
      Alert.alert("Error", "Failed to add pet. Please try again.");
    }
  }, [formData, image, navigation]);

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Pet</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.formContainer}>
        <TouchableOpacity
          style={styles.imagePickerContainer}
          onPress={pickImage}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.petImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera" size={40} color="#6d28d9" />
              <Text style={styles.imagePlaceholderText}>Add Pet Photo</Text>
            </View>
          )}
        </TouchableOpacity>
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
        <TouchableOpacity style={styles.addButton} onPress={handleAddPet}>
          <Text style={styles.addButtonText}>Add Pet</Text>
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
            <Text style={styles.modalTitle}>Select Date</Text>
            <Text style={styles.dateText}>{tempDate.toDateString()}</Text>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              style={styles.datePicker}
              textColor="#6d28d9" // Ensure text color is black for visibility
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonConfirm]}
                onPress={confirmDate}
              >
                <Text style={styles.buttonText}>Confirm</Text>
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
  imagePickerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  petImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#6d28d9",
    borderStyle: "dashed",
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: "#6d28d9",
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#6d28d9",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  addButtonText: {
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
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6d28d9",
    marginBottom: 15,
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
    fontWeight: "bold",
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
    backgroundColor: "#9ca3af",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
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
    color: "#4c1d95",
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
    color: "#4c1d95",
    paddingRight: 30,
    backgroundColor: "#fff",
  },
});

export default AddPet;
