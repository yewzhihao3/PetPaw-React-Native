import React from "react";
import { View, Text } from "react-native";
import * as Progress from "react-native-progress";
import { styles } from "./styles";

const ProgressBars = ({ currentVirtualPet, theme }) => {
  if (!currentVirtualPet) {
    return null; // or return a loading indicator
  }

  return (
    <View>
      <View style={styles.progressBarContainer}>
        <Text style={[styles.progressBarLabel, { color: theme.text }]}>
          Happiness
        </Text>
        <Progress.Bar
          progress={currentVirtualPet.happiness / 100}
          width={null}
          height={20}
          color="#3498db"
          unfilledColor={theme.barBackground}
          borderWidth={0}
        />
      </View>
      <View style={styles.progressBarContainer}>
        <Text style={[styles.progressBarLabel, { color: theme.text }]}>
          Fullness
        </Text>
        <Progress.Bar
          progress={currentVirtualPet.hunger / 100}
          width={null}
          height={20}
          color="#f1c40f"
          unfilledColor={theme.barBackground}
          borderWidth={0}
        />
      </View>
      <View style={styles.progressBarContainer}>
        <Text style={[styles.progressBarLabel, { color: theme.text }]}>
          Cleanliness
        </Text>
        <Progress.Bar
          progress={currentVirtualPet.cleanliness / 100}
          width={null}
          height={20}
          color="#2ecc71"
          unfilledColor={theme.barBackground}
          borderWidth={0}
        />
      </View>
    </View>
  );
};

export default ProgressBars;
