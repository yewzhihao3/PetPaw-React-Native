import React from "react";
import { View, Image, Text } from "react-native";
import { styles } from "./styles";
import { getCatImage } from "../../utils/assetManager";

const PetImage = ({ petState, petType, theme }) => {
  const image = getCatImage(petType, petState);

  if (!image) {
    return (
      <View
        style={[
          styles.petImageContainer,
          { backgroundColor: theme.buttonBackground },
        ]}
      >
        <Text style={[styles.errorText, { color: theme.text }]}>
          Image not found
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.petImageContainer,
        { backgroundColor: theme.buttonBackground },
      ]}
    >
      <Image source={image} style={styles.petImage} />
    </View>
  );
};

export default PetImage;
