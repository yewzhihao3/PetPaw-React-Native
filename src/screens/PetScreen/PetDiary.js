import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { Swipeable } from "react-native-gesture-handler";
import AddEditEntryModal from "../../components/PetScreenComp/AddEditEntryModal";
import {
  getUserPets,
  getDiaryEntries,
  createDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
} from "./PapiService";

const PetDiary = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedPetId } = route.params;

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [isAddEditModalVisible, setIsAddEditModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const primaryColor = "#6200ee";

  const fetchPets = useCallback(async () => {
    try {
      const fetchedPets = await getUserPets();
      setPets(fetchedPets);
      const initialSelectedPet =
        fetchedPets.find((pet) => pet.id === selectedPetId) || fetchedPets[0];
      setSelectedPet(initialSelectedPet);
    } catch (error) {
      console.error("Error fetching pets:", error);
      Alert.alert("Error", "Failed to fetch pets. Please try again.");
    }
  }, [selectedPetId]);

  const fetchDiaryEntries = useCallback(async (petId, date) => {
    if (!petId || !date) return;
    setIsLoading(true);
    try {
      const entries = await getDiaryEntries(petId);
      const filteredEntries = entries.filter((entry) => entry.date === date);
      setDiaryEntries(filteredEntries);
    } catch (error) {
      console.error("Error fetching diary entries:", error);
      Alert.alert("Error", "Failed to fetch diary entries. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  useFocusEffect(
    useCallback(() => {
      if (selectedPet && selectedDate) {
        fetchDiaryEntries(selectedPet.id, selectedDate);
      }
    }, [selectedPet, selectedDate, fetchDiaryEntries])
  );

  const onDateSelect = (day) => {
    setSelectedDate(day.dateString);
    if (selectedPet) {
      fetchDiaryEntries(selectedPet.id, day.dateString);
    }
  };

  const renderPetItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.petItem,
        selectedPet && selectedPet.id === item.id && styles.selectedPetItem,
      ]}
      onPress={() => {
        setSelectedPet(item);
        if (selectedDate) {
          fetchDiaryEntries(item.id, selectedDate);
        }
      }}
    >
      <Image source={{ uri: item.profile_picture }} style={styles.petImage} />
      <Text
        style={[
          styles.petName,
          selectedPet && selectedPet.id === item.id && styles.selectedPetName,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderRightActions = (progress, dragX, onClick) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });
    return (
      <TouchableOpacity style={styles.deleteAction} onPress={onClick}>
        <Animated.View
          style={[
            styles.deleteActionContent,
            { transform: [{ translateX: trans }] },
          ]}
        >
          <Ionicons name="trash-outline" size={24} color="white" />
          <Animated.Text style={styles.deleteActionText}>Delete</Animated.Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderDiaryEntry = useCallback(
    ({ item }) => (
      <Swipeable
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, () => handleDeleteEntry(item.id))
        }
      >
        <TouchableOpacity
          style={styles.diaryEntry}
          onPress={() => {
            setSelectedEntry(item);
            setIsAddEditModalVisible(true);
          }}
        >
          <View style={styles.entryContent}>
            <View style={styles.entryTextContent}>
              <Text style={styles.entryTitle}>{item.activity}</Text>
              <Text style={styles.entryMood}>{item.mood}</Text>
              <Text style={styles.entryDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
            {item.image_url && (
              <Image
                source={{ uri: item.image_url }}
                style={styles.entryImage}
                onError={(e) =>
                  console.log("Image load error:", e.nativeEvent.error)
                }
              />
            )}
          </View>
        </TouchableOpacity>
      </Swipeable>
    ),
    [handleDeleteEntry, setSelectedEntry, setIsAddEditModalVisible]
  );

  const handleAddEntry = () => {
    if (!selectedPet) {
      Alert.alert("Error", "Please select a pet first.");
      return;
    }
    setSelectedEntry(null);
    setIsAddEditModalVisible(true);
  };

  const handleSaveEntry = async (entryData) => {
    console.log("handleSaveEntry called with data:", entryData);

    if (!selectedPet) {
      console.log("No pet selected");
      Alert.alert("Error", "No pet selected. Please select a pet first.");
      return;
    }

    try {
      setIsAddEditModalVisible(false);
      // Refresh the entries list
      await fetchDiaryEntries(selectedPet.id, selectedDate);
    } catch (error) {
      console.error("Error handling saved entry:", error);
      Alert.alert("Error", "Failed to update diary entries. Please try again.");
    }
  };

  const handleDeleteEntry = async (entryId) => {
    Alert.alert("Delete Entry", "Are you sure you want to delete this entry?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await deleteDiaryEntry(selectedPet.id, entryId);
            fetchDiaryEntries(selectedPet.id, selectedDate);
          } catch (error) {
            console.error("Error deleting diary entry:", error);
            Alert.alert(
              "Error",
              "Failed to delete diary entry. Please try again."
            );
          }
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pet Diary</Text>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={pets}
        renderItem={renderPetItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        style={styles.petList}
        showsHorizontalScrollIndicator={false}
      />

      <Calendar
        onDayPress={onDateSelect}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: primaryColor },
        }}
        theme={{
          arrowColor: primaryColor,
          todayTextColor: primaryColor,
          selectedDayBackgroundColor: primaryColor,
          selectedDayTextColor: "#ffffff",
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 16,
        }}
      />

      <View style={styles.entriesContainer}>
        <View style={styles.entriesHeader}>
          <Text style={styles.entriesTitle}>Entries for {selectedDate}</Text>
          <TouchableOpacity onPress={handleAddEntry} style={styles.addButton}>
            <Ionicons name="add-circle" size={24} color={primaryColor} />
          </TouchableOpacity>
        </View>
        {isLoading ? (
          <ActivityIndicator size="large" color={primaryColor} />
        ) : (
          <FlatList
            data={diaryEntries}
            renderItem={renderDiaryEntry}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <Text style={styles.emptyListText}>
                No entries for this date.
              </Text>
            }
          />
        )}
      </View>

      <AddEditEntryModal
        isVisible={isAddEditModalVisible}
        onClose={() => {
          console.log("AddEditEntryModal onClose called");
          setIsAddEditModalVisible(false);
        }}
        onSave={(result) => {
          console.log("AddEditEntryModal onSave called with result:", result);
          handleSaveEntry(result);
        }}
        initialEntry={selectedEntry}
        petId={selectedPet?.id}
        selectedDate={selectedDate}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#6200ee",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  petList: {
    maxHeight: 100,
    marginVertical: 10,
  },
  petItem: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  selectedPetItem: {
    borderBottomWidth: 2,
    borderBottomColor: "#6200ee",
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
  },
  petName: {
    fontSize: 14,
    color: "#333",
  },
  selectedPetName: {
    color: "#6200ee",
    fontWeight: "bold",
  },
  entriesContainer: {
    flex: 1,
    padding: 16,
  },
  entriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  entriesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6200ee",
  },
  addButton: {
    padding: 5,
  },
  diaryEntry: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  entryContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  entryTextContent: {
    flex: 1,
    marginRight: 10,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  entryMood: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  entryDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  entryImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  emptyListText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  deleteAction: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "flex-end",
    width: 100,
    height: "90%",
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  deleteActionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 16,
  },
  deleteActionText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default PetDiary;
