import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import { useTheme } from "../../../theme/Themecontext";

const DEFAULT_TIPS = [
  {
    id: "1",
    category: "Care",
    title: "Daily Care Routine",
    content:
      "Feed your pet at least twice a day and clean them regularly to maintain high happiness levels.",
    isCompleted: false,
  },
  {
    id: "2",
    category: "Exercise",
    title: "Walking Benefits",
    content:
      "Take more steps with your device to help your pet stay healthy and earn special trophies!",
    isCompleted: false,
  },
  {
    id: "3",
    category: "Bonding",
    title: "Playing Together",
    content:
      "Regular play sessions increase your pet's happiness and strengthen your bond.",
    isCompleted: false,
  },
  {
    id: "4",
    category: "Growth",
    title: "Level Up System",
    content:
      "Your pet can reach up to level 10! Earn trophies to help them grow stronger.",
    isCompleted: false,
  },
  {
    id: "5",
    category: "Care",
    title: "Cleanliness Matters",
    content:
      "A clean pet is a happy pet! Don't let the cleanliness meter drop below 30%.",
    isCompleted: false,
  },
  {
    id: "6",
    category: "Food",
    title: "Feeding Schedule",
    content:
      "Keep the hunger meter above 30% to prevent your pet from becoming unhappy.",
    isCompleted: false,
  },
];

const PetTamagotchiTips = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [tips, setTips] = useState(DEFAULT_TIPS);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    loadFonts();
    loadTips();
  }, []);

  const loadFonts = async () => {
    await Font.loadAsync({
      PressStart2P: require("../../../assets/fonts/8bits/PressStart2P-Regular.ttf"),
    });
    setFontsLoaded(true);
  };

  const loadTips = async () => {
    try {
      const storedTips = await AsyncStorage.getItem("petTips");
      if (storedTips !== null) {
        setTips(JSON.parse(storedTips));
      } else {
        await AsyncStorage.setItem("petTips", JSON.stringify(DEFAULT_TIPS));
      }
    } catch (error) {
      console.error("Error loading tips:", error);
    }
  };

  const saveTips = async (newTips) => {
    try {
      await AsyncStorage.setItem("petTips", JSON.stringify(newTips));
    } catch (error) {
      console.error("Error saving tips:", error);
    }
  };

  const toggleTipCompletion = async (id) => {
    const updatedTips = tips.map((tip) =>
      tip.id === id ? { ...tip, isCompleted: !tip.isCompleted } : tip
    );
    setTips(updatedTips);
    await saveTips(updatedTips);
  };

  const categories = ["All", "Care", "Exercise", "Bonding", "Growth", "Food"];
  const filteredTips =
    filter === "All" ? tips : tips.filter((tip) => tip.category === filter);

  const renderTip = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.tipItem,
        {
          backgroundColor: theme.cardBackground,
          borderLeftColor: theme.primaryButton,
          opacity: item.isCompleted ? 0.7 : 1,
        },
      ]}
      onPress={() => toggleTipCompletion(item.id)}
    >
      <View style={styles.tipHeader}>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: theme.primaryButton },
          ]}
        >
          <Text style={[styles.categoryText, { color: theme.buttonText }]}>
            {item.category}
          </Text>
        </View>
        <Feather
          name={item.isCompleted ? "check-circle" : "circle"}
          size={20}
          color={theme.primaryButton}
        />
      </View>
      <Text style={[styles.tipTitle, { color: theme.text }]}>{item.title}</Text>
      <Text style={[styles.tipContent, { color: theme.text }]}>
        {item.content}
      </Text>
    </TouchableOpacity>
  );

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={theme.icon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Pet Tips
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                {
                  backgroundColor:
                    filter === item ? theme.primaryButton : "transparent",
                  borderColor: theme.primaryButton,
                },
              ]}
              onPress={() => setFilter(item)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      filter === item ? theme.buttonText : theme.primaryButton,
                  },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredTips}
        renderItem={renderTip}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.tipsList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "PressStart2P",
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterText: {
    fontFamily: "PressStart2P",
    fontSize: 10,
  },
  tipsList: {
    padding: 20,
  },
  tipItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontFamily: "PressStart2P",
    fontSize: 10,
  },
  tipTitle: {
    fontFamily: "PressStart2P",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "bold",
  },
  tipContent: {
    fontFamily: "PressStart2P",
    fontSize: 12,
    lineHeight: 20,
  },
});

export default PetTamagotchiTips;
