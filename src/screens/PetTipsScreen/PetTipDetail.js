import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getPetTipById } from "./Pet_Tips_apiService";

const PetTipDetail = ({ route, navigation }) => {
  const { tipId } = route.params;
  const [currentStep, setCurrentStep] = useState(0);
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPetTip();
  }, [tipId]);

  const fetchPetTip = async () => {
    try {
      const fetchedTip = await getPetTipById(tipId);
      setTip(fetchedTip);
    } catch (error) {
      console.error("Error fetching pet tip:", error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < tip.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleWatchVideo = () => {
    Linking.openURL(tip.video_url);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6d28d9" />
        </View>
      </SafeAreaView>
    );
  }

  if (!tip) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Tip not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tip.title}</Text>
        <TouchableOpacity
          onPress={handleWatchVideo}
          style={styles.headerButton}
        >
          <Ionicons name="videocam" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={{ uri: tip.image_url }}
          style={styles.image}
          defaultSource={require("../../../assets/placeholder.webp")}
        />
        <Text style={styles.description}>{tip.description}</Text>
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>{tip.steps[currentStep].title}</Text>
          <Text style={styles.stepContent}>
            {tip.steps[currentStep].content}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentStep === 0 && styles.disabledButton]}
          onPress={handlePrevious}
          disabled={currentStep === 0}
        >
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>{`${currentStep + 1}/${
          tip.steps.length
        }`}</Text>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentStep === tip.steps.length - 1 && styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={currentStep === tip.steps.length - 1}
        >
          <Text style={styles.navButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: "white",
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    flex: 1,
    textAlign: "center",
  },
  content: {
    padding: 20,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 20,
    lineHeight: 24,
  },
  stepContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6d28d9",
    marginBottom: 12,
  },
  stepContent: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 24,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#6d28d9",
    borderRadius: 8,
  },
  navButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
  stepIndicator: {
    fontSize: 16,
    color: "#4B5563",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PetTipDetail;
