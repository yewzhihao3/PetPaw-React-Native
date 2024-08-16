import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import * as Font from "expo-font";
import { useTheme } from "../../../theme/Themecontext";
import { Ionicons } from "@expo/vector-icons";
import PetDisplay from "./PetDisplay";
import GameActions from "./ActionButtons";
import LetGoPetModal from "./LetGoPetModal";
import Navbar from "../../components/HomeScreen/Navbar";
import { loadPets, savePets, updateDayCount } from "./utils";

const TamagotchiGame = () => {
  const { isDarkMode, theme } = useTheme();
  const navigation = useNavigation();

  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [pets, setPets] = useState([]);
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [petState, setPetState] = useState("normal");
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLetGoModalVisible, setIsLetGoModalVisible] = useState(false);

  const loadAndSetPets = useCallback(async () => {
    let loadedPets = await loadPets();
    loadedPets = updateDayCount(loadedPets);
    setPets(loadedPets);
    if (loadedPets.length > 0) {
      setCurrentPetIndex(0);
      updatePetState(loadedPets[0]);
    } else {
      navigation.replace("TamagotchiOnboarding");
    }
  }, [navigation]);

  useEffect(() => {
    async function initialize() {
      await Font.loadAsync({
        PressStart2P: require("../../../assets/fonts/8bits/PressStart2P-Regular.ttf"),
      });
      setFontsLoaded(true);
      await loadAndSetPets();
      setIsLoading(false);
    }
    initialize();
  }, [loadAndSetPets]);

  useFocusEffect(
    useCallback(() => {
      if (!isLoading) {
        loadAndSetPets();
      }
    }, [isLoading, loadAndSetPets])
  );

  const updatePetState = (pet) => {
    if (pet) {
      if (pet.hunger < 30) setPetState("hungry");
      else if (pet.cleanliness < 30) setPetState("dirty");
      else if (pet.happiness > 70) setPetState("happy");
      else setPetState("normal");
    }
  };

  const handleLetGo = () => {
    if (pets.length > 0) {
      setIsLetGoModalVisible(true);
    }
  };

  const confirmLetGo = async () => {
    if (
      pets.length === 0 ||
      currentPetIndex < 0 ||
      currentPetIndex >= pets.length
    ) {
      return;
    }
    try {
      const updatedPets = pets.filter((_, index) => index !== currentPetIndex);
      await savePets(updatedPets);
      setPets(updatedPets);
      setIsLetGoModalVisible(false);
      if (updatedPets.length === 0) {
        navigation.replace("TamagotchiOnboarding");
      } else {
        setCurrentPetIndex(0);
        updatePetState(updatedPets[0]);
      }
    } catch (error) {
      console.error("Error removing pet:", error);
    }
  };

  const updatePetStatAndState = (stat, value) => {
    if (pets.length > 0 && currentPetIndex >= 0) {
      setPets((currentPets) => {
        const updatedPets = currentPets.map((pet, index) => {
          if (index === currentPetIndex) {
            const updatedStat = Math.min(100, Math.max(0, pet[stat] + value));
            return { ...pet, [stat]: updatedStat };
          }
          return pet;
        });
        return updatedPets;
      });
    }
  };

  const handleAddPet = () => {
    navigation.navigate("AddPet");
  };

  if (!fontsLoaded || isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  const currentPet = pets[currentPetIndex];
  if (!currentPet) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.text, { color: theme.text }]}>
          No pets available
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Tamagotchi
        </Text>
      </View>
      <View style={styles.content}>
        <PetDisplay
          currentPet={pets[currentPetIndex]}
          petState={petState}
          theme={theme}
          onChangePet={(direction) => {
            const newIndex =
              direction === "next"
                ? (currentPetIndex + 1) % pets.length
                : (currentPetIndex - 1 + pets.length) % pets.length;
            setCurrentPetIndex(newIndex);
            updatePetState(pets[newIndex]);
          }}
        />
        <GameActions
          theme={theme}
          isActionInProgress={isActionInProgress}
          setIsActionInProgress={setIsActionInProgress}
          setPetState={setPetState}
          updatePetStat={updatePetStatAndState}
          navigation={navigation}
          onLetGo={handleLetGo}
          onAddPet={handleAddPet}
          dayCount={currentPet.dayCount}
        />
      </View>
      <Navbar activeScreen="Tamagotchi" />
      {pets.length > 0 && (
        <LetGoPetModal
          isVisible={isLetGoModalVisible}
          onClose={() => setIsLetGoModalVisible(false)}
          onConfirm={confirmLetGo}
          petName={currentPet.name}
          theme={theme}
          petType={currentPet.type}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "PressStart2P",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 20,
    width: "100%",
  },
  text: {
    fontFamily: "PressStart2P",
    fontSize: 16,
  },
});

export default TamagotchiGame;
