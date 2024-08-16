import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import PetImage from "./PetImage";
import ProgressBars from "./ProgressBars";
import { styles } from "./styles";

const PetDisplay = ({ currentPet, petState, theme, onChangePet }) => {
  const getPetMood = () => {
    if (petState.startsWith("cleaning")) return "Cleaning";
    if (petState.startsWith("eating")) return "Eating";
    if (petState.startsWith("playing")) return "Playing";
    if (petState === "happy") return "Happy";
    if (petState === "hungry") return "Hungry";
    if (petState === "dirty") return "Dirty";
    return "Normal";
  };

  return (
    <View>
      <PetImage petState={petState} petType={currentPet.type} theme={theme} />
      <View style={styles.petInfo}>
        <TouchableOpacity onPress={() => onChangePet("prev")}>
          <Feather name="chevron-left" size={24} color={theme.icon} />
        </TouchableOpacity>
        <View style={styles.petNameLevel}>
          <Text style={[styles.petName, { color: theme.text }]}>
            {currentPet.name}
          </Text>
          <Text style={[styles.petLevel, { color: theme.text }]}>
            Level: {currentPet.level}
          </Text>
          <Text style={[styles.petMood, { color: theme.text }]}>
            Mood: {getPetMood()}
          </Text>
        </View>
        <TouchableOpacity onPress={() => onChangePet("next")}>
          <Feather name="chevron-right" size={24} color={theme.icon} />
        </TouchableOpacity>
      </View>
      <ProgressBars currentPet={currentPet} theme={theme} />
    </View>
  );
};

export default PetDisplay;
