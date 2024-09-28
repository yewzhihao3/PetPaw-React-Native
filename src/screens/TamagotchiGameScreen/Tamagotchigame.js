import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  Vibration,
  Alert,
  ScrollView,
  RefreshControl,
  Image,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import * as Font from "expo-font";
import { Accelerometer } from "expo-sensors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import Navbar from "../../components/HomeScreen/Navbar";
import TamagotchiApiService from "./TamagotchiApiService";
import { updateDayCount } from "./utils";
import { getCatImage } from "../../utils/assetManager";
import PetDisplay from "./PetDisplay";
import LetGoPetModal from "./LetGoPetModal";

const TamagotchiGame = () => {
  const navigation = useNavigation();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [virtualPets, setVirtualPets] = useState([]);
  const [currentVirtualPetIndex, setCurrentVirtualPetIndex] = useState(0);
  const [virtualPetState, setVirtualPetState] = useState("normal");
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLetGoModalVisible, setIsLetGoModalVisible] = useState(false);
  const [userId, setUserId] = useState(null);
  const [stepCount, setStepCount] = useState(0);
  const [trophies, setTrophies] = useState([]);
  const [accelerometerData, setAccelerometerData] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [petLevel, setPetLevel] = useState(1);
  const lastStepTime = useRef(0);
  const lastUpdateTime = useRef(0);

  const loadAndSetVirtualPets = useCallback(
    async (userId) => {
      try {
        const userVirtualPets = await TamagotchiApiService.getUserVirtualPets(
          userId
        );
        if (userVirtualPets.length > 0) {
          const updatedPets = await Promise.all(
            userVirtualPets.map(async (pet) => {
              const createdAt = new Date(pet.created_at);
              const today = new Date();
              const diffTime = Math.abs(today - createdAt);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays !== pet.day_count) {
                const updatedPet = await TamagotchiApiService.updateVirtualPet(
                  pet.id,
                  {
                    day_count: diffDays,
                  }
                );
                pet.day_count = updatedPet.day_count;
              }

              const steps = await TamagotchiApiService.getTotalSteps(pet.id);

              return {
                ...pet,
                daysTogether: pet.day_count,
                totalSteps: steps,
              };
            })
          );

          setVirtualPets(updatedPets);
          setCurrentVirtualPetIndex(0);
          updateVirtualPetState(updatedPets[0]);

          const currentPet = updatedPets[0];
          setPetLevel(Math.min(currentPet.level, 10));

          const savedStepCount = await AsyncStorage.getItem("stepCount");
          if (savedStepCount) {
            setStepCount(parseInt(savedStepCount, 10));
          }

          const fetchedTrophies =
            await TamagotchiApiService.getVirtualPetTrophies(currentPet.id);
          setTrophies(fetchedTrophies);
        } else {
          navigation.replace("TamagotchiOnboarding");
        }
      } catch (error) {
        console.error("Error loading virtual pets:", error);
        Alert.alert("Error", "Failed to load virtual pets. Please try again.");
      }
    },
    [navigation]
  );

  useEffect(() => {
    async function initialize() {
      await Font.loadAsync({
        PressStart2P: require("../../../assets/fonts/8bits/PressStart2P-Regular.ttf"),
      });
      setFontsLoaded(true);

      const storedUserId = await AsyncStorage.getItem("userId");
      setUserId(storedUserId);

      if (storedUserId) {
        await loadAndSetVirtualPets(storedUserId);
      } else {
        navigation.replace("Login");
      }

      let accelerometerSubscription;
      Accelerometer.setUpdateInterval(100);
      accelerometerSubscription = Accelerometer.addListener(
        handleAccelerometerData
      );

      setIsLoading(false);

      return () => {
        if (accelerometerSubscription) {
          accelerometerSubscription.remove();
        }
      };
    }
    initialize();
  }, [loadAndSetVirtualPets, navigation]);

  useEffect(() => {
    const updateInterval = setInterval(async () => {
      if (virtualPets.length > 0 && stepCount > 0) {
        const currentTime = new Date().getTime();
        if (currentTime - lastUpdateTime.current >= 600000) {
          await updateBackendSteps();
          lastUpdateTime.current = currentTime;
        }
      }
    }, 60000);

    return () => clearInterval(updateInterval);
  }, [stepCount, virtualPets]);

  useFocusEffect(
    useCallback(() => {
      if (!isLoading && userId) {
        loadAndSetVirtualPets(userId);
      }
    }, [isLoading, loadAndSetVirtualPets, userId])
  );

  const handleAccelerometerData = (data) => {
    setAccelerometerData(data);
    detectStep(data);
  };

  const detectStep = (data) => {
    const { x, y, z } = data;
    const acceleration = Math.sqrt(x * x + y * y + z * z);
    const currentTime = new Date().getTime();

    const ACCELERATION_THRESHOLD = 1.2;
    const TIME_THRESHOLD = 250;

    if (
      acceleration > ACCELERATION_THRESHOLD &&
      currentTime - lastStepTime.current > TIME_THRESHOLD
    ) {
      setStepCount((prevCount) => {
        const newCount = prevCount + 1;
        AsyncStorage.setItem("stepCount", newCount.toString());
        return newCount;
      });
      lastStepTime.current = currentTime;
    }
  };

  const updateBackendSteps = async () => {
    if (virtualPets.length > 0) {
      const currentPet = virtualPets[currentVirtualPetIndex];
      try {
        const response = await TamagotchiApiService.updateTotalSteps(
          currentPet.id,
          { steps: stepCount }
        );
        console.log("Steps synced with backend:", response);

        setVirtualPets((prevPets) =>
          prevPets.map((pet, index) =>
            index === currentVirtualPetIndex
              ? { ...pet, totalSteps: pet.totalSteps + stepCount }
              : pet
          )
        );

        setStepCount(0);
        AsyncStorage.setItem("stepCount", "0");
        await checkAndUnlockTrophies();
      } catch (error) {
        console.error("Failed to sync steps with backend:", error);
      }
    }
  };

  const updateVirtualPetState = (virtualPet) => {
    if (virtualPet) {
      if (virtualPet.hunger < 30) setVirtualPetState("hungry");
      else if (virtualPet.cleanliness < 30) setVirtualPetState("dirty");
      else if (virtualPet.happiness > 70) setVirtualPetState("happy");
      else setVirtualPetState("normal");
    }
  };

  const checkAndUnlockTrophies = async () => {
    if (virtualPets.length > 0) {
      const currentVirtualPet = virtualPets[currentVirtualPetIndex];
      try {
        const newTrophies = await TamagotchiApiService.checkAndUnlockTrophies(
          currentVirtualPet.id,
          {
            step_count: currentVirtualPet.totalSteps + stepCount,
            day_count: currentVirtualPet.daysTogether,
          }
        );

        console.log("New trophies:", newTrophies);

        if (newTrophies.length > 0) {
          const updatedTrophies = [...trophies, ...newTrophies];
          setTrophies(updatedTrophies);

          const newLevel = Math.min(updatedTrophies.length, 10);
          console.log("Updated level:", newLevel);
          setPetLevel(newLevel);

          await TamagotchiApiService.updateVirtualPet(currentVirtualPet.id, {
            level: newLevel,
          });

          setVirtualPets((prevPets) =>
            prevPets.map((pet, index) =>
              index === currentVirtualPetIndex
                ? { ...pet, level: newLevel }
                : pet
            )
          );
        }
      } catch (error) {
        console.error("Error checking and unlocking trophies:", error);
      }
    }
  };

  const animateAction = (action, frames, duration) => {
    let frame = 1;
    setVirtualPetState(action);
    const interval = setInterval(() => {
      frame++;
      if (frame > frames) {
        clearInterval(interval);
        setVirtualPetState("normal");
        setIsActionInProgress(false);
      }
    }, duration / frames);
  };

  const handleFeed = async () => {
    if (isActionInProgress) return;
    setIsActionInProgress(true);
    Vibration.vibrate(500);
    animateAction("eating", 4, 2000);
    await updateVirtualPetStatAndState("hunger", 20);
  };

  const handleClean = async () => {
    if (isActionInProgress) return;
    setIsActionInProgress(true);
    Vibration.vibrate(500);
    animateAction("cleaning", 4, 2000);
    await updateVirtualPetStatAndState("cleanliness", 25);
  };

  const handlePlay = async () => {
    if (isActionInProgress) return;
    setIsActionInProgress(true);
    Vibration.vibrate(500);
    animateAction("playing", 4, 2000);
    await updateVirtualPetStatAndState("happiness", 15);
  };

  const updateVirtualPetStatAndState = async (stat, value) => {
    if (virtualPets.length > 0 && currentVirtualPetIndex >= 0) {
      const updatedVirtualPets = virtualPets.map((virtualPet, index) => {
        if (index === currentVirtualPetIndex) {
          const updatedStat = Math.min(
            100,
            Math.max(0, virtualPet[stat] + value)
          );
          return { ...virtualPet, [stat]: updatedStat };
        }
        return virtualPet;
      });

      setVirtualPets(updatedVirtualPets);

      try {
        const updatedVirtualPet = updatedVirtualPets[currentVirtualPetIndex];
        await TamagotchiApiService.syncVirtualPetState(updatedVirtualPet.id, {
          [stat]: updatedVirtualPet[stat],
        });
        updateVirtualPetState(updatedVirtualPet);
      } catch (error) {
        console.error("Error syncing virtual pet state:", error);
        Alert.alert("Error", "Failed to update virtual pet. Please try again.");
      }
    }
  };

  const handleLetGo = () => {
    if (virtualPets.length > 0) {
      setIsLetGoModalVisible(true);
    }
  };

  const confirmLetGo = async () => {
    if (
      virtualPets.length > 0 &&
      currentVirtualPetIndex >= 0 &&
      currentVirtualPetIndex < virtualPets.length
    ) {
      try {
        const virtualPetToDelete = virtualPets[currentVirtualPetIndex];
        await TamagotchiApiService.deleteVirtualPet(virtualPetToDelete.id);
        const updatedVirtualPets = virtualPets.filter(
          (_, index) => index !== currentVirtualPetIndex
        );
        setVirtualPets(updatedVirtualPets);
        setIsLetGoModalVisible(false);
        if (updatedVirtualPets.length === 0) {
          navigation.replace("TamagotchiOnboarding");
        } else {
          setCurrentVirtualPetIndex(0);
          updateVirtualPetState(updatedVirtualPets[0]);
        }
      } catch (error) {
        console.error("Error removing virtual pet:", error);
        Alert.alert("Error", "Failed to remove virtual pet. Please try again.");
      }
    }
  };

  const getVirtualPetImage = (virtualPet, state) => {
    return getCatImage(virtualPet.type, state);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (virtualPets.length > 0) {
        const currentPet = virtualPets[currentVirtualPetIndex];
        await updateBackendSteps();
        const updatedSteps = await TamagotchiApiService.getTotalSteps(
          currentPet.id
        );
        setVirtualPets((prevPets) =>
          prevPets.map((pet, index) =>
            index === currentVirtualPetIndex
              ? { ...pet, totalSteps: updatedSteps }
              : pet
          )
        );
        await checkAndUnlockTrophies();
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      Alert.alert("Error", "Failed to refresh data. Please try again.");
    }
    setRefreshing(false);
  }, [virtualPets, currentVirtualPetIndex]);

  if (!fontsLoaded || isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6d28d9" />
      </View>
    );
  }

  if (virtualPets.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No virtual pets available</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.replace("TamagotchiOnboarding")}
        >
          <Text style={styles.buttonText}>Add Your First Virtual Pet</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentVirtualPet = virtualPets[currentVirtualPetIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#6d28d9" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tamagotchi</Text>
        <TouchableOpacity
          style={styles.addPetButton}
          onPress={() => navigation.navigate("AddPet")}
        >
          <Feather name="plus" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6d28d9"]}
            tintColor="#6d28d9"
          />
        }
      >
        <PetDisplay
          currentVirtualPet={currentVirtualPet}
          virtualPetState={virtualPetState}
          onChangeVirtualPet={(direction) => {
            const newIndex =
              direction === "next"
                ? (currentVirtualPetIndex + 1) % virtualPets.length
                : (currentVirtualPetIndex - 1 + virtualPets.length) %
                  virtualPets.length;
            setCurrentVirtualPetIndex(newIndex);
            updateVirtualPetState(virtualPets[newIndex]);
          }}
          getVirtualPetImage={getVirtualPetImage}
          petLevel={petLevel}
        />
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handlePlay}
            disabled={isActionInProgress}
          >
            <Feather name="play" size={24} color="#ffffff" />
            <Text style={styles.actionButtonText}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleFeed}
            disabled={isActionInProgress}
          >
            <Feather name="coffee" size={24} color="#ffffff" />
            <Text style={styles.actionButtonText}>Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleClean}
            disabled={isActionInProgress}
          >
            <Feather name="droplet" size={24} color="#ffffff" />
            <Text style={styles.actionButtonText}>Clean</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate("PetDiary", { petId: currentVirtualPet.id })
            }
          >
            <Feather name="book-open" size={24} color="#ffffff" />
            <Text style={styles.actionButtonText}>Pet Diary</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate("TrophyRoom", { petId: currentVirtualPet.id })
            }
          >
            <Feather name="award" size={24} color="#ffffff" />
            <Text style={styles.actionButtonText}>Trophies</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleLetGo}>
            <Feather name="trash-2" size={24} color="#ffffff" />
            <Text style={styles.actionButtonText}>Let Go</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Navbar activeScreen="Tamagotchi" />
      <LetGoPetModal
        isVisible={isLetGoModalVisible}
        onClose={() => setIsLetGoModalVisible(false)}
        onConfirm={confirmLetGo}
        virtualPetName={currentVirtualPet ? currentVirtualPet.name : ""}
        petType={currentVirtualPet ? currentVirtualPet.type : ""}
        getVirtualPetImage={getVirtualPetImage}
      />
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
    backgroundColor: "#6d28d9",
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    fontFamily: "PressStart2P",
  },
  addPetButton: {
    padding: 8,
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  text: {
    fontFamily: "PressStart2P",
    fontSize: 16,
    textAlign: "center",
    color: "#6d28d9",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#6d28d9",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontFamily: "PressStart2P",
    fontSize: 16,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },
  actionButton: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#6d28d9",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionButtonText: {
    color: "#ffffff",
    fontFamily: "PressStart2P",
    fontSize: 10,
    marginTop: 5,
    textAlign: "center",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "PressStart2P",
    color: "#6d28d9",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    fontFamily: "PressStart2P",
    color: "#6d28d9",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#6d28d9",
    minWidth: 100,
  },
  modalButtonDanger: {
    backgroundColor: "#ef4444",
  },
  modalButtonText: {
    color: "#ffffff",
    fontFamily: "PressStart2P",
    fontSize: 14,
    textAlign: "center",
  },
});

export default TamagotchiGame;
