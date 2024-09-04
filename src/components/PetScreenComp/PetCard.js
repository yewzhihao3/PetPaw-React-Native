// src/components/PetScreenComp/PetCard.js
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import styles from "../../../theme/PetTheme";

const PetCard = ({ pet, onPress }) => {
  const calculateAge = (birthdate) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const age = calculateAge(pet.birthdate);

  return (
    <TouchableOpacity style={styles.petCard} onPress={onPress}>
      <Image source={{ uri: pet.profile_picture }} style={styles.petImage} />
      <View style={styles.petInfo}>
        <Text style={styles.petName}>{pet.name}</Text>
        <Text style={styles.petDetails}>
          {pet.sex} • {age} {age === 1 ? "year" : "years"} old
        </Text>
        <Text style={styles.petDetails}>
          {pet.breed} • {pet.weight.toFixed(2)} lbs
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default PetCard;
