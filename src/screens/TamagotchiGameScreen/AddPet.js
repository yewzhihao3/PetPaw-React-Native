import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CommonActions } from "@react-navigation/native";
import { getCatImage } from "../../utils/assetManager";
import { addPet, loadPets } from "./utils";
import { useTheme } from "../../../theme/Themecontext";

const catTypes = [{ name: "White Cat" }, { name: "BSH" }];

const AddPetScreen = ({ navigation }) => {
  const [petName, setPetName] = useState("");
  const [selectedCat, setSelectedCat] = useState(null);
  const { theme, isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (theme) {
      setIsLoading(false);
    }
  }, [theme]);

  const handleAddPet = async () => {
    if (petName.trim() && selectedCat) {
      try {
        const newPet = {
          name: petName,
          type: selectedCat.name,
          happiness: 50,
          hunger: 50,
          cleanliness: 50,
          level: 1,
        };
        await addPet(newPet);
        Alert.alert("Success", "New pet added successfully!", [
          {
            text: "OK",
            onPress: () => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: "Tamagotchi",
                      params: { screen: "TamagotchiGame" },
                    },
                  ],
                })
              );
            },
          },
        ]);
      } catch (error) {
        console.error("Error adding pet:", error);
        Alert.alert("Error", "Failed to add new pet. Please try again.");
      }
    } else {
      Alert.alert("Error", "Please enter a pet name and select a cat type.");
    }
  };

  const handleCancel = async () => {
    const pets = await loadPets();
    if (pets.length > 0) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            { name: "Tamagotchi", params: { screen: "TamagotchiGame" } },
          ],
        })
      );
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            { name: "Tamagotchi", params: { screen: "TamagotchiOnboarding" } },
          ],
        })
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Add New Pet</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.label, { color: theme.text }]}>Pet Name:</Text>
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.text }]}
          onChangeText={setPetName}
          value={petName}
          placeholder="Enter pet name"
          placeholderTextColor={isDarkMode ? "#A0AEC0" : "#718096"}
        />
        <Text style={[styles.label, { color: theme.text }]}>
          Select Cat Type:
        </Text>
        <View style={styles.catContainer}>
          {catTypes.map((cat) => (
            <TouchableOpacity
              key={cat.name}
              style={styles.catOption}
              onPress={() => setSelectedCat(cat)}
            >
              <Image
                source={getCatImage(cat.name, "normal")}
                style={[
                  styles.catImage,
                  selectedCat?.name === cat.name && styles.selectedCat,
                ]}
              />
              <Text
                style={[
                  styles.catNameText,
                  { color: theme.text },
                  selectedCat?.name === cat.name && styles.selectedCatNameText,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primaryButton }]}
          onPress={handleAddPet}
        >
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>
            Add Pet
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: isDarkMode ? theme.background : "white",
              borderColor: theme.primaryButton,
              borderWidth: 2,
            },
          ]}
          onPress={handleCancel}
        >
          <Text style={[styles.buttonText, { color: theme.primaryButton }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "PressStart2P",
    textAlign: "center",
  },
  scrollContent: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: "PressStart2P",
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontFamily: "PressStart2P",
  },
  catContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  catOption: {
    alignItems: "center",
  },
  catImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedCat: {
    borderWidth: 4,
    borderColor: "#6d28d9",
  },
  catNameText: {
    fontSize: 12,
    fontFamily: "PressStart2P",
    textAlign: "center",
  },
  selectedCatNameText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "PressStart2P",
  },
});

export default AddPetScreen;
