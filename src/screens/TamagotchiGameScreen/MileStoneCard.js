import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const MilestoneCard = ({ pet, milestone, stats }) => (
  <View style={styles.card}>
    <Image source={{ uri: pet.imageUrl }} style={styles.petImage} />
    <Text style={styles.milestoneText}>{milestone}</Text>
    <Text style={styles.statsText}>{stats}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    width: 300,
    height: 400,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  petImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  milestoneText: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
  },
  statsText: {
    fontSize: 18,
    marginTop: 10,
  },
});

export default MilestoneCard;
