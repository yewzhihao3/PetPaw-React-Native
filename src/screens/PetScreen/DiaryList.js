import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import AddEditEntryModal from "../../components/PetScreenComp/AddEditEntryModal";
import { deleteDiaryEntry } from "./PapiService";

const DiaryList = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { entries: initialEntries, petId, petName } = route.params;

  const [entries, setEntries] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (initialEntries?.length > 0) {
      const sortedEntries = [...initialEntries].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setEntries(sortedEntries);
    }
  }, [initialEntries]);

  const handleDeleteEntry = (entryId) => {
    Alert.alert("Delete Entry", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDiaryEntry(petId, entryId);
            const newEntries = entries.filter((entry) => entry.id !== entryId);
            setEntries(newEntries);
          } catch (error) {
            console.error("Error deleting entry:", error);
            Alert.alert("Error", "Failed to delete entry. Please try again.");
          }
        },
      },
    ]);
  };

  const getMoodIcon = (mood) => {
    switch (mood) {
      case "Happy":
        return "happy-outline";
      case "Excited":
        return "star-outline";
      case "Calm":
        return "leaf-outline";
      case "Anxious":
        return "alert-circle-outline";
      default:
        return "ellipse-outline";
    }
  };

  const getMoodStyle = (mood) => {
    const moodColors = {
      Happy: { backgroundColor: "#E8F5E9", color: "#2E7D32" },
      Excited: { backgroundColor: "#EDE7F6", color: "#6200ee" },
      Calm: { backgroundColor: "#E3F2FD", color: "#1565C0" },
      Anxious: { backgroundColor: "#FFF3E0", color: "#EF6C00" },
    };
    return moodColors[mood] || { backgroundColor: "#F5F5F5", color: "#666666" };
  };

  const renderEntry = ({ item }) => (
    <View style={styles.entryContainer}>
      <TouchableOpacity
        style={styles.entryContent}
        onPress={() => {
          setSelectedEntry(item);
          setIsModalVisible(true);
        }}
        activeOpacity={0.7}
      >
        {/* Date and Activity Header */}
        <View style={styles.entryHeader}>
          <View style={styles.dateBox}>
            <Text style={styles.dateDay}>{new Date(item.date).getDate()}</Text>
            <Text style={styles.dateMonth}>
              {new Date(item.date).toLocaleString("default", {
                month: "short",
              })}
            </Text>
            <Text style={styles.dateYear}>
              {new Date(item.date).getFullYear()}
            </Text>
          </View>
          <View style={styles.titleSection}>
            <Text style={styles.activity}>{item.activity}</Text>
            <View style={[styles.moodContainer, getMoodStyle(item.mood)]}>
              <Ionicons
                name={getMoodIcon(item.mood)}
                size={16}
                color={getMoodStyle(item.mood).color}
                style={styles.moodIcon}
              />
              <Text
                style={[styles.mood, { color: getMoodStyle(item.mood).color }]}
              >
                {item.mood}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteEntry(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color="#FF4444" />
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description} numberOfLines={3}>
            {item.description}
          </Text>
        </View>

        {/* Image */}
        {item.image_url && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.image_url }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.imageFadeOverlay} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Diary Entries</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <FlatList
          data={entries}
          renderItem={renderEntry}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={() => (
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>{petName}'s Diary Entries</Text>
              <Text style={styles.headerSubtitle}>
                {entries.length} {entries.length === 1 ? "entry" : "entries"}{" "}
                total
              </Text>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={() => navigation.goBack()}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No diary entries found</Text>
            </View>
          )}
        />
      </View>

      <AddEditEntryModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={() => {
          setIsModalVisible(false);
          navigation.goBack();
        }}
        initialEntry={selectedEntry}
        petId={petId}
        selectedDate={selectedEntry?.date}
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
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    flex: 1,
    textAlign: "center",
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  headerContainer: {
    padding: 20,
    backgroundColor: "white",
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#6200ee",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  listContainer: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  entryContainer: {
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#6200ee",
  },
  entryContent: {
    padding: 16,
  },
  entryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  dateBox: {
    backgroundColor: "#6200ee",
    padding: 8,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 50,
  },
  dateDay: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  dateMonth: {
    fontSize: 12,
    color: "white",
    textTransform: "uppercase",
  },
  dateYear: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.8)",
  },
  titleSection: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  activity: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  moodContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  moodIcon: {
    marginRight: 4,
  },
  mood: {
    fontSize: 14,
    fontWeight: "500",
  },
  descriptionContainer: {
    marginLeft: 70,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  imageContainer: {
    marginLeft: 70,
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageFadeOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    borderRadius: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  separator: {
    height: 16,
  },
});

export default DiaryList;
