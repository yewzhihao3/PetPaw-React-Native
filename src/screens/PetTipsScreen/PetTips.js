import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PetTipsList from "./PetTipsList";
import AskAIButton from "./AskAIButton";
import { getAllPetTips, getPetTipsByCategory } from "./Pet_Tips_apiService";

const PetTips = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [petTips, setPetTips] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Dog", "Cat", "Fish", "Bird"];

  useEffect(() => {
    fetchPetTips();
  }, [selectedCategory]);

  const fetchPetTips = async () => {
    setLoading(true);
    try {
      let tips;
      if (selectedCategory === "All") {
        tips = await getAllPetTips();
      } else {
        tips = await getPetTipsByCategory(selectedCategory);
      }
      setPetTips(tips);
    } catch (error) {
      console.error("Error fetching pet tips:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pet Tips</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.logoContainer}>
        <Image
          source={require("../../../assets/Pet_Tips_Logo.png")}
          style={styles.logo}
        />
      </View>

      <View style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategory,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <PetTipsList
        petTips={petTips}
        loading={loading}
        navigation={navigation}
      />

      <AskAIButton
        onPress={() => {
          /* Handle AI button press */
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#6d28d9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  logoContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  logo: {
    width: 80,
    height: 80,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6d28d9",
    marginTop: 10,
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  selectedCategory: {
    backgroundColor: "#6d28d9",
  },
  categoryText: {
    fontSize: 16,
    color: "#4B5563",
  },
  selectedCategoryText: {
    color: "white",
  },
});

export default PetTips;
