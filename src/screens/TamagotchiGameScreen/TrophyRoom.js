import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from "react-native";
import TamagotchiApiService from "./TamagotchiApiService";
import { Feather } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import ViewShot from "react-native-view-shot";

const TrophyRoom = ({ route, navigation }) => {
  const [trophies, setTrophies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stepCount, setStepCount] = useState(0);
  const [daysWithPet, setDaysWithPet] = useState(0);
  const [selectedTrophy, setSelectedTrophy] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [petLevel, setPetLevel] = useState(1);
  const petId = route.params?.petId;
  const viewShotRef = useRef();

  useEffect(() => {
    if (petId) {
      fetchTrophies();
    } else {
      setIsLoading(false);
    }
  }, [petId]);

  const fetchTrophies = async () => {
    try {
      const petData = await TamagotchiApiService.getVirtualPet(petId);
      setStepCount(petData.total_steps || 0);
      setDaysWithPet(petData.day_count || 0);

      const fetchedTrophies = await TamagotchiApiService.getVirtualPetTrophies(
        petId
      );
      setTrophies(fetchedTrophies);

      const newLevel = Math.min(fetchedTrophies.length, 10);
      setPetLevel(newLevel);

      await TamagotchiApiService.updateVirtualPet(petId, { level: newLevel });
    } catch (error) {
      console.error("Error fetching trophies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stepTrophies = [
    { name: "First Steps", threshold: 1000, icon: "👣" },
    { name: "Walk in the Park", threshold: 5000, icon: "🌳" },
    { name: "Neighborhood Explorer", threshold: 10000, icon: "🏘️" },
    { name: "City Wanderer", threshold: 50000, icon: "🏙️" },
    { name: "Marathon Master", threshold: 100000, icon: "🏅" },
  ];

  const dayTrophies = [
    { name: "New Friend", threshold: 1, icon: "🐣" },
    { name: "Bonding Time", threshold: 7, icon: "🤝" },
    { name: "Loyal Companion", threshold: 30, icon: "🐕" },
    { name: "Inseparable Duo", threshold: 90, icon: "👫" },
    { name: "Lifelong Partners", threshold: 365, icon: "💖" },
  ];

  const isTrophyUnlocked = (trophy, count) => count >= trophy.threshold;

  const handleTrophyPress = (trophy, count, total) => {
    setSelectedTrophy({ ...trophy, count, total });
    setModalVisible(true);
  };

  const renderTrophy = (trophy, count, total) => {
    const unlocked = isTrophyUnlocked(trophy, count);
    return (
      <TouchableOpacity
        key={trophy.name}
        style={[
          styles.trophy,
          unlocked ? styles.unlockedTrophy : styles.lockedTrophy,
        ]}
        onPress={() => handleTrophyPress(trophy, count, total)}
      >
        <Text style={styles.trophyIcon}>{trophy.icon}</Text>
        <Text
          style={[
            styles.trophyName,
            { color: unlocked ? "#6d28d9" : "#a0aec0" },
          ]}
        >
          {unlocked ? trophy.name : "???"}
        </Text>
      </TouchableOpacity>
    );
  };

  const generateShareableImage = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      return uri;
    } catch (error) {
      console.error("Error capturing view:", error);
    }
  };

  const shareTrophies = async () => {
    try {
      const uri = await generateShareableImage();
      if (!(await Sharing.isAvailableAsync())) {
        alert(`Sharing isn't available on your platform`);
        return;
      }
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.log("Error =>", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Trophy Room</Text>
        <TouchableOpacity onPress={shareTrophies}>
          <Feather name="share" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.levelText}>
            Level: {petLevel === 10 ? "Max" : petLevel}
          </Text>

          <View style={styles.trophySection}>
            <Text style={styles.sectionTitle}>Step Trophies</Text>
            <View style={styles.trophyGrid}>
              {stepTrophies.map((trophy) =>
                renderTrophy(trophy, stepCount, "steps")
              )}
            </View>
            <Text style={styles.totalCount}>Total Steps: {stepCount}</Text>
          </View>

          <View style={styles.trophySection}>
            <Text style={styles.sectionTitle}>Day Trophies</Text>
            <View style={styles.trophyGrid}>
              {dayTrophies.map((trophy) =>
                renderTrophy(trophy, daysWithPet, "days")
              )}
            </View>
            <Text style={styles.totalCount}>Total Days: {daysWithPet}</Text>
          </View>
        </ScrollView>
      </ViewShot>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedTrophy?.name}</Text>
            <Text style={styles.modalIcon}>{selectedTrophy?.icon}</Text>
            <Text style={styles.modalProgress}>
              Progress: {selectedTrophy?.count}/{selectedTrophy?.threshold}{" "}
              {selectedTrophy?.total}
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#6d28d9",
  },
  title: {
    fontSize: 24,
    fontFamily: "PressStart2P",
    color: "#ffffff",
    textAlign: "center",
  },
  scrollContent: {
    padding: 20,
  },
  levelText: {
    fontSize: 18,
    fontFamily: "PressStart2P",
    textAlign: "center",
    marginBottom: 20,
    color: "#6d28d9",
  },
  trophySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "PressStart2P",
    marginBottom: 10,
    color: "#6d28d9",
  },
  trophyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  trophy: {
    width: "30%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderRadius: 10,
    padding: 10,
    borderWidth: 2,
  },
  unlockedTrophy: {
    backgroundColor: "rgba(109, 40, 217, 0.1)",
    borderColor: "#6d28d9",
  },
  lockedTrophy: {
    backgroundColor: "rgba(160, 174, 192, 0.1)",
    borderColor: "#a0aec0",
  },
  trophyIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  trophyName: {
    fontSize: 10,
    fontFamily: "PressStart2P",
    textAlign: "center",
  },
  totalCount: {
    fontSize: 14,
    fontFamily: "PressStart2P",
    textAlign: "center",
    marginTop: 10,
    color: "#6d28d9",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#6d28d9",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "PressStart2P",
    marginBottom: 10,
    textAlign: "center",
    color: "#6d28d9",
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  modalProgress: {
    fontSize: 14,
    fontFamily: "PressStart2P",
    marginBottom: 20,
    color: "#6d28d9",
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#6d28d9",
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: "PressStart2P",
    color: "#ffffff",
  },
});

export default TrophyRoom;
