import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Progress from "react-native-progress";

const PetDisplay = ({
  currentVirtualPet,
  virtualPetState,
  onChangeVirtualPet,
  getVirtualPetImage,
  petLevel,
}) => {
  if (!currentVirtualPet) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading virtual pet...</Text>
      </View>
    );
  }

  const getVirtualPetMood = () => {
    if (virtualPetState.startsWith("cleaning")) return "Cleaning";
    if (virtualPetState.startsWith("eating")) return "Eating";
    if (virtualPetState.startsWith("playing")) return "Playing";
    if (virtualPetState === "happy") return "Happy";
    if (virtualPetState === "hungry") return "Hungry";
    if (virtualPetState === "dirty") return "Dirty";
    return "Normal";
  };

  return (
    <View>
      <View style={styles.petImageContainer}>
        <Image
          source={getVirtualPetImage(currentVirtualPet, virtualPetState)}
          style={styles.petImage}
        />
      </View>
      <View style={styles.petInfo}>
        <TouchableOpacity onPress={() => onChangeVirtualPet("prev")}>
          <Feather name="chevron-left" size={24} color="#6d28d9" />
        </TouchableOpacity>
        <View style={styles.petNameLevel}>
          <Text style={styles.petName}>{currentVirtualPet.name}</Text>
          <Text style={styles.petLevel}>
            Level: {petLevel === 10 ? "Max" : petLevel}
          </Text>
          <Text style={styles.petMood}>Mood: {getVirtualPetMood()}</Text>
          <Text style={styles.petStats}>
            Days Together: {currentVirtualPet.daysTogether}
          </Text>
          <Text style={styles.petStats}>
            Total Steps: {currentVirtualPet.totalSteps}
          </Text>
        </View>
        <TouchableOpacity onPress={() => onChangeVirtualPet("next")}>
          <Feather name="chevron-right" size={24} color="#6d28d9" />
        </TouchableOpacity>
      </View>
      <View style={styles.progressBarsContainer}>
        <View style={styles.progressBarContainer}>
          <Text style={styles.progressBarLabel}>Happiness</Text>
          <Progress.Bar
            progress={currentVirtualPet.happiness / 100}
            width={null}
            height={20}
            color="#6d28d9"
            unfilledColor="#e5e7eb"
            borderWidth={0}
          />
        </View>
        <View style={styles.progressBarContainer}>
          <Text style={styles.progressBarLabel}>Fullness</Text>
          <Progress.Bar
            progress={currentVirtualPet.hunger / 100}
            width={null}
            height={20}
            color="#6d28d9"
            unfilledColor="#e5e7eb"
            borderWidth={0}
          />
        </View>
        <View style={styles.progressBarContainer}>
          <Text style={styles.progressBarLabel}>Cleanliness</Text>
          <Progress.Bar
            progress={currentVirtualPet.cleanliness / 100}
            width={null}
            height={20}
            color="#6d28d9"
            unfilledColor="#e5e7eb"
            borderWidth={0}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "PressStart2P",
    color: "#6d28d9",
    textAlign: "center",
  },
  petImageContainer: {
    width: "75%",
    aspectRatio: 1,
    marginBottom: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#6d28d9",
  },
  petImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  petInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  petNameLevel: {
    alignItems: "center",
  },
  petName: {
    fontSize: 24,
    marginBottom: 5,
    fontFamily: "PressStart2P",
    color: "#6d28d9",
  },
  petLevel: {
    fontSize: 14,
    fontFamily: "PressStart2P",
    color: "#6d28d9",
  },
  petMood: {
    fontSize: 15,
    fontFamily: "PressStart2P",
    marginTop: 5,
    color: "#6d28d9",
  },
  petStats: {
    fontSize: 12,
    fontFamily: "PressStart2P",
    marginTop: 5,
    color: "#6d28d9",
  },
  progressBarsContainer: {
    marginBottom: 20,
  },
  progressBarContainer: {
    marginBottom: 15,
  },
  progressBarLabel: {
    fontSize: 12,
    marginBottom: 5,
    fontFamily: "PressStart2P",
    color: "#6d28d9",
  },
});

export default PetDisplay;
