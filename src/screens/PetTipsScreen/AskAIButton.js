import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const AskAIButton = () => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate("AIChat");
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Ionicons
        name="bulb-outline" // Changed to lightbulb icon
        size={24}
        color="white"
        style={styles.icon}
      />
      <Text style={styles.text}>Ask AI</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6d28d9",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default AskAIButton;
