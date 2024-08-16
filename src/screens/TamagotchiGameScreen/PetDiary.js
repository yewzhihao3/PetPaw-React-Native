import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Calendar } from "react-native-calendars";
import * as Font from "expo-font";
import { useTheme } from "../../../theme/Themecontext";

const MOODS = [
  "happy",
  "sad",
  "excited",
  "angry",
  "relaxed",
  "playful",
  "sleepy",
  "hungry",
];

const PetDiaryScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [entries, setEntries] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [newEntry, setNewEntry] = useState({
    content: "",
    mood: "happy",
    activities: "",
    photo: null,
  });
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [modalAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    loadFonts();
    loadEntries();
  }, []);

  useEffect(() => {
    if (modalVisible) {
      Animated.spring(modalAnimation, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(modalAnimation, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible]);

  const loadFonts = async () => {
    await Font.loadAsync({
      PressStart2P: require("../../../assets/fonts/8bits/PressStart2P-Regular.ttf"),
    });
    setFontsLoaded(true);
  };

  const loadEntries = async () => {
    try {
      const storedEntries = await AsyncStorage.getItem("petDiaryEntries");
      if (storedEntries !== null) {
        setEntries(JSON.parse(storedEntries));
      }
    } catch (error) {
      console.error("Error loading entries:", error);
    }
  };

  const saveEntries = async (newEntries) => {
    try {
      await AsyncStorage.setItem("petDiaryEntries", JSON.stringify(newEntries));
    } catch (error) {
      console.error("Error saving entries:", error);
    }
  };

  const addOrUpdateEntry = () => {
    if (newEntry.content.trim() !== "") {
      const entryToSave = {
        id: editingEntry ? editingEntry.id : Date.now().toString(),
        date: selectedDate,
        ...newEntry,
      };

      const updatedEntries = editingEntry
        ? entries.map((entry) =>
            entry.id === editingEntry.id ? entryToSave : entry
          )
        : [entryToSave, ...entries];

      setEntries(updatedEntries);
      saveEntries(updatedEntries);
      setNewEntry({ content: "", mood: "happy", activities: "", photo: null });
      setEditingEntry(null);
      setModalVisible(false);
    }
  };

  const deleteEntry = (id) => {
    Alert.alert("Delete Entry", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => {
          const updatedEntries = entries.filter((entry) => entry.id !== id);
          setEntries(updatedEntries);
          saveEntries(updatedEntries);
        },
        style: "destructive",
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.entryItem,
        {
          backgroundColor: theme.cardBackground,
          borderLeftColor: theme.primaryButton,
        },
      ]}
    >
      <View style={styles.entryHeader}>
        <Text style={[styles.dateText, { color: theme.primaryButton }]}>
          {item.date}
        </Text>
        <View
          style={[styles.moodBadge, { backgroundColor: theme.primaryButton }]}
        >
          <Text style={[styles.moodText, { color: theme.buttonText }]}>
            {item.mood}
          </Text>
        </View>
      </View>
      <Text style={[styles.contentText, { color: theme.text }]}>
        {item.content}
      </Text>
      {item.activities && (
        <View style={styles.activitiesContainer}>
          <Feather name="activity" size={16} color={theme.primaryButton} />
          <Text style={[styles.activitiesText, { color: theme.text }]}>
            {item.activities}
          </Text>
        </View>
      )}
      {item.photo && (
        <Image source={{ uri: item.photo }} style={styles.entryImage} />
      )}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setEditingEntry(item);
            setNewEntry(item);
            setModalVisible(true);
          }}
        >
          <Feather name="edit" size={20} color={theme.primaryButton} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => deleteEntry(item.id)}
          style={styles.deleteButton}
        >
          <Feather name="trash-2" size={20} color={theme.primaryButton} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredEntries = entries.filter(
    (entry) => entry.date === selectedDate
  );

  const markedDates = entries.reduce((acc, entry) => {
    acc[entry.date] = {
      marked: true,
      dotColor: isDarkMode ? "white" : "black",
    };
    return acc;
  }, {});

  markedDates[selectedDate] = {
    ...markedDates[selectedDate],
    selected: true,
    selectedColor: theme.primaryButton,
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color={theme.icon} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Pet Diary
          </Text>
          <TouchableOpacity
            onPress={() => {
              setEditingEntry(null);
              setNewEntry({
                content: "",
                mood: "happy",
                activities: "",
                photo: null,
              });
              setModalVisible(true);
            }}
          >
            <Feather name="plus" size={24} color={theme.icon} />
          </TouchableOpacity>
        </View>

        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          theme={{
            backgroundColor: theme.background,
            calendarBackground: theme.background,
            textSectionTitleColor: theme.text,
            selectedDayBackgroundColor: theme.primaryButton,
            selectedDayTextColor: theme.buttonText,
            todayTextColor: theme.primaryButton,
            dayTextColor: theme.text,
            textDisabledColor: "#6d28d9",
            dotColor: isDarkMode ? "white" : "black",
            selectedDotColor: theme.buttonText,
            arrowColor: theme.icon,
            monthTextColor: theme.text,
            indicatorColor: theme.icon,
            textDayFontFamily: "PressStart2P",
            textMonthFontFamily: "PressStart2P",
            textDayHeaderFontFamily: "PressStart2P",
          }}
        />

        <FlatList
          data={filteredEntries}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.entriesList}
        />

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.grayOverlay} />
            <Animated.View
              style={[
                styles.modalContent,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  transform: [{ scale: modalAnimation }],
                },
              ]}
            >
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    borderColor: theme.border,
                    backgroundColor: isDarkMode ? "#2A2A2A" : "#F0F0F0",
                  },
                ]}
                onChangeText={(text) =>
                  setNewEntry({ ...newEntry, content: text })
                }
                value={newEntry.content}
                placeholder="Write your diary entry..."
                placeholderTextColor={isDarkMode ? "#808080" : "#A0A0A0"}
                multiline
              />
              <Text style={[styles.label, { color: theme.text }]}>
                Select Mood:
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.moodSelector}
              >
                {MOODS.map((mood) => (
                  <TouchableOpacity
                    key={mood}
                    style={[
                      styles.moodButton,
                      {
                        backgroundColor:
                          newEntry.mood === mood
                            ? theme.primaryButton
                            : "transparent",
                        borderColor: theme.primaryButton,
                        borderWidth: 1,
                      },
                    ]}
                    onPress={() => setNewEntry({ ...newEntry, mood })}
                  >
                    <Text
                      style={[
                        styles.moodButtonText,
                        {
                          color:
                            newEntry.mood === mood
                              ? theme.buttonText
                              : theme.primaryButton,
                        },
                      ]}
                    >
                      {mood}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={[styles.label, { color: theme.text }]}>
                Activities:
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    borderColor: theme.border,
                    backgroundColor: isDarkMode ? "#2A2A2A" : "#F0F0F0",
                  },
                ]}
                onChangeText={(text) =>
                  setNewEntry({ ...newEntry, activities: text })
                }
                value={newEntry.activities}
                placeholder="e.g., Walk, Play fetch, Grooming"
                placeholderTextColor={isDarkMode ? "#808080" : "#A0A0A0"}
              />
              <TouchableOpacity
                style={[
                  styles.photoButton,
                  {
                    backgroundColor: "transparent",
                    borderColor: theme.primaryButton,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => {
                  setNewEntry({
                    ...newEntry,
                    photo: "https://via.placeholder.com/150",
                  });
                }}
              >
                <Text
                  style={[
                    styles.photoButtonText,
                    { color: theme.primaryButton },
                  ]}
                >
                  Add Photo
                </Text>
              </TouchableOpacity>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    {
                      backgroundColor: "transparent",
                      borderColor: theme.primaryButton,
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: theme.primaryButton },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: theme.primaryButton },
                  ]}
                  onPress={addOrUpdateEntry}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: theme.buttonText },
                    ]}
                  >
                    {editingEntry ? "Update" : "Add"} Entry
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "PressStart2P",
  },
  entriesList: {
    paddingBottom: 20,
  },
  entryItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dateText: {
    fontFamily: "PressStart2P",
    fontSize: 12,
    fontWeight: "bold",
  },
  moodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moodText: {
    fontFamily: "PressStart2P",
    fontSize: 10,
    fontWeight: "bold",
  },
  contentText: {
    fontFamily: "PressStart2P",
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  activitiesContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  activitiesText: {
    fontFamily: "PressStart2P",
    fontSize: 12,
    marginLeft: 8,
  },
  entryImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  editButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  grayOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  input: {
    fontFamily: "PressStart2P",
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
  },
  label: {
    fontFamily: "PressStart2P",
    fontSize: 14,
    marginBottom: 8,
  },
  moodSelector: {
    flexDirection: "row",
    marginBottom: 12,
  },
  moodButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  moodButtonText: {
    fontFamily: "PressStart2P",
    fontSize: 12,
  },
  photoButton: {
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 16,
  },
  photoButtonText: {
    fontFamily: "PressStart2P",
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginHorizontal: 4,
  },
  modalButtonText: {
    fontFamily: "PressStart2P",
    fontSize: 14,
  },
});

export default PetDiaryScreen;
