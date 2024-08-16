import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../../theme/Themecontext";

const TamagotchiOnboarding = () => {
  const navigation = useNavigation();
  const { isDarkMode, theme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <View style={styles.topNav}></View>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>
          Welcome to Tamagotchi!
        </Text>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../../assets/Game/onboarding.png")}
            style={styles.image}
          />
        </View>
        <Text style={[styles.description, { color: theme.text }]}>
          Looks like you don't have a pet yet. Let's start by adding your first
          virtual pet!
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primaryButton }]}
          onPress={() => navigation.navigate("AddPet")}
        >
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>
            Add Your First Pet
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  topNav: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: 250,
    height: 250,
    borderRadius: 125,
    overflow: "hidden",
    marginTop: 20,
    marginBottom: 30,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 20,
    fontFamily: "PressStart2P",
    textAlign: "center",
    lineHeight: 32,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    marginHorizontal: 10,
    marginBottom: 30,
    fontFamily: "PressStart2P",
    lineHeight: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "PressStart2P",
    textAlign: "center",
  },
});

export default TamagotchiOnboarding;
