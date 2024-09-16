import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  FlatList,
  Dimensions,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  createDiaryEntry,
  updateDiaryEntry,
} from "../../screens/PetScreen/PapiService";

const moodOptions = ["Happy", "Excited", "Calm", "Tired", "Anxious", "Sick"];
const { width } = Dimensions.get("window");

const AddEditEntryModal = ({
  isVisible,
  onClose,
  onSave,
  initialEntry,
  petId,
}) => {
  const [date, setDate] = useState(new Date());
  const [activity, setActivity] = useState("");
  const [mood, setMood] = useState("Happy");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialEntry) {
      setDate(new Date(initialEntry.date));
      setActivity(initialEntry.activity);
      setMood(initialEntry.mood);
      setDescription(initialEntry.description);
      setImage(initialEntry.image_url);
    } else {
      // Reset form for new entries
      setDate(new Date());
      setActivity("");
      setMood("Happy");
      setDescription("");
      setImage(null);
    }
  }, [initialEntry, isVisible]);

  const handleCreate = async (entryData, imageUri) => {
    console.log("Creating new entry");
    return await createDiaryEntry(
      petId,
      entryData,
      imageUri ? { uri: imageUri } : null
    );
  };

  const handleUpdate = async (entryData, imageUri) => {
    console.log("Updating existing entry");
    return await updateDiaryEntry(petId, initialEntry.id, entryData, imageUri);
  };

  const handleSave = async () => {
    console.log("handleSave function called");

    if (!petId) {
      console.log("No pet selected");
      Alert.alert("Error", "No pet selected. Please select a pet first.");
      return;
    }

    if (!activity.trim()) {
      console.log("Activity is empty");
      Alert.alert("Error", "Activity cannot be empty.");
      return;
    }

    setIsLoading(true);
    try {
      const entryData = {
        date: date.toISOString().split("T")[0],
        activity: activity.trim(),
        mood,
        description: description.trim(),
      };

      console.log("About to make API call with data:", {
        petId,
        entryData,
        image,
      });

      let result;
      if (initialEntry) {
        result = await handleUpdate(entryData, image);
      } else {
        result = await handleCreate(entryData, image);
      }

      console.log("API response:", result);

      onSave(result);
      onClose();
    } catch (error) {
      console.error("Error saving diary entry:", error);
      console.error("Error details:", error.response?.data);
      Alert.alert(
        "Error",
        `Failed to save diary entry. ${
          error.response?.data?.detail || "Please try again."
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePick = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "You need to allow access to your photos to upload an image."
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
      setImage(result.assets[0].uri);
    }
  };

  const renderMoodItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.moodOption, mood === item && styles.selectedMood]}
      onPress={() => setMood(item)}
    >
      <Text style={mood === item ? styles.selectedMoodText : styles.moodText}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{date.toDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}

            <Text style={styles.label}>Activity</Text>
            <TextInput
              style={styles.input}
              value={activity}
              onChangeText={setActivity}
              placeholder="e.g., Morning Walk, Vet Visit"
            />

            <Text style={styles.label}>Mood</Text>
            <FlatList
              data={moodOptions}
              renderItem={renderMoodItem}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.moodContainer}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              value={description}
              onChangeText={setDescription}
              multiline
              placeholder="Describe the activity or any observations"
            />

            <Text style={styles.label}>Image (Optional)</Text>
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={handleImagePick}
            >
              {image ? (
                <Image source={{ uri: image }} style={styles.pickedImage} />
              ) : (
                <View style={styles.imagePickerPlaceholder}>
                  <Ionicons name="camera" size={24} color="#6200ee" />
                  <Text style={styles.imagePickerText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
    color: "#6200ee",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: "top",
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  moodContainer: {
    marginBottom: 10,
  },
  moodOption: {
    borderWidth: 1,
    borderColor: "#6200ee",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  selectedMood: {
    backgroundColor: "#6200ee",
  },
  moodText: {
    color: "#6200ee",
  },
  selectedMoodText: {
    color: "white",
  },
  imagePicker: {
    width: width - 40, // Full width minus padding
    height: 150,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  imagePickerPlaceholder: {
    alignItems: "center",
  },
  imagePickerText: {
    marginTop: 10,
    color: "#6200ee",
  },
  pickedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#6200ee",
    marginRight: 10,
  },
  saveButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    backgroundColor: "#6200ee",
  },
  cancelButtonText: {
    color: "#6200ee",
    fontWeight: "bold",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default AddEditEntryModal;
