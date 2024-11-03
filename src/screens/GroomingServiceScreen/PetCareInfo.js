// src/components/PetCareInfo.js

import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const facts = [
  "Dogs have three eyelids.",
  "Cats spend 15-20% of their time grooming themselves.",
  "A dog's sense of smell is 10,000 to 100,000 times stronger than humans.",
  "Regularly brushing your pet's coat can prevent matting and reduce shedding.",
  "Pets can get sunburned too, especially those with light-colored fur.",
  "Dental disease affects up to 80% of dogs over the age of three.",
  "Cats have 32 muscles in each ear.",
  "A dog's normal body temperature is between 101 to 102.5 degrees Fahrenheit.",
];

export const AnimatedDidYouKnow = () => {
  const [factIndex, setFactIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const changeFact = () => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      setFactIndex((prevIndex) => (prevIndex + 1) % facts.length);
    };

    const interval = setInterval(changeFact, 5000); // Change fact every 5 seconds

    return () => clearInterval(interval);
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bulb" size={24} color="#8A2BE2" />
        <Text style={styles.title}>Did You Know?</Text>
      </View>
      <Animated.Text style={[styles.content, { opacity: fadeAnim }]}>
        {facts[factIndex]}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8A2BE2",
    marginLeft: 10,
  },
  content: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
});

export default AnimatedDidYouKnow;
