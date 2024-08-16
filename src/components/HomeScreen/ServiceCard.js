import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../theme/Themecontext";

const ServiceCard = ({ title, imageSource, route }) => {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation();

  const backgroundColor = isDarkMode ? "#1f1f1f" : "#F0F0F0"; // Dark gray for dark mode, light gray for light mode

  const handlePress = () => {
    switch (route) {
      case "Tamagotchi":
        navigation.navigate("Tamagotchi");
        break;
      case "ECommerce":
        navigation.navigate("ECommerce");
        break;
      default:
        Alert.alert("Coming Soon", `The ${title} feature is coming soon!`);
    }
  };

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={handlePress}>
      <View
        style={[
          styles.cardContent,
          { backgroundColor: backgroundColor, borderColor: "#6d28d9" },
        ]}
      >
        <View style={styles.imageContainer}>
          <Image source={imageSource} style={styles.image} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: "45%",
    aspectRatio: 1,
    margin: "2.5%",
    borderRadius: 18,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#6d28d9",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
  },
  cardContent: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 2,
    borderColor: "#6d28d9",
    borderRadius: 16,
  },
  imageContainer: {
    width: "80%",
    height: "70%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
});

export default ServiceCard;
