import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../../config";

const { width } = Dimensions.get("window");

const PetSelector = ({ pets, selectedPet, onSelectPet }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.petSelectorContainer}
    >
      {pets.map((pet) => (
        <TouchableOpacity
          key={pet.id}
          style={[
            styles.petBubble,
            selectedPet &&
              selectedPet.id === pet.id &&
              styles.selectedPetBubble,
          ]}
          onPress={() => onSelectPet(pet)}
        >
          <Text
            style={[
              styles.petBubbleText,
              selectedPet &&
                selectedPet.id === pet.id &&
                styles.selectedPetBubbleText,
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {pet.name}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[
          styles.petBubble,
          selectedPet === "other" && styles.selectedPetBubble,
        ]}
        onPress={() => onSelectPet("other")}
      >
        <Text
          style={[
            styles.petBubbleText,
            selectedPet === "other" && styles.selectedPetBubbleText,
          ]}
        >
          Other
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showPetSelector, setShowPetSelector] = useState(true);
  const navigation = useNavigation();
  const flatListRef = useRef(null);

  useEffect(() => {
    getUserIdAndFetchPets();
  }, []);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const getUserIdAndFetchPets = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const userIdFromStorage = await AsyncStorage.getItem("userId");

      if (!userIdFromStorage) {
        throw new Error("User ID not found in storage");
      }

      setUserId(userIdFromStorage);
      await fetchPets(userIdFromStorage, token);
    } catch (error) {
      console.error("Error getting user ID or fetching pets:", error);
      Alert.alert("Error", "Failed to load your pets. Please try again.");
    }
  };

  const fetchPets = async (userId, token) => {
    try {
      const response = await axios.get(`${API_URL}/pets/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPets(response.data);
    } catch (error) {
      console.error("Error fetching user's pets:", error);
      Alert.alert("Error", "Failed to fetch your pets. Please try again.");
    }
  };

  const fetchPetInfo = async (petId) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const [petInfo, medicalRecords, prescriptions] = await Promise.all([
        axios.get(`${API_URL}/pets/${petId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/pets/${petId}/medical-records`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/prescriptions/${petId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      return {
        info: petInfo.data,
        medicalRecords: medicalRecords.data,
        prescriptions: prescriptions.data,
      };
    } catch (error) {
      console.error("Error fetching pet information:", error);
      Alert.alert(
        "Error",
        "Failed to fetch pet information. Please try again."
      );
      return null;
    }
  };

  const resetChat = () => {
    setMessages([]);
    setInputText("");
    setIsLoading(false);
    setSelectedPet(null);
    setShowPetSelector(true);
  };

  const sendMessage = async () => {
    if (inputText.trim() === "" || (!selectedPet && selectedPet !== "other"))
      return;

    setShowPetSelector(false);

    const userMessage = { role: "user", content: inputText };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem("userToken");
      let petInfo = null;

      if (selectedPet !== "other") {
        petInfo = await fetchPetInfo(selectedPet.id);
        if (!petInfo) {
          throw new Error("Failed to fetch pet information");
        }
      }

      const response = await axios.post(
        `${API_URL}/api/v1/ai/chat`,
        {
          messages: [...messages, userMessage],
          petInfo: petInfo,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const aiMessage = { role: "assistant", content: response.data.response };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      console.error("Error details:", error.response?.data);

      let errorMessage =
        "I'm sorry, but I encountered an error while processing your request. Please try again or check your connection.";
      if (error.response?.data?.detail) {
        errorMessage = `Error: ${error.response.data.detail}`;
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: errorMessage },
      ]);
      Alert.alert("Error", "Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.role === "user" ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.role === "user" ? styles.userMessageText : styles.aiMessageText,
        ]}
      >
        {item.content}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Pet Assistant</Text>
          <TouchableOpacity onPress={resetChat} style={styles.headerButton}>
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>
        {showPetSelector && (
          <PetSelector
            pets={pets}
            selectedPet={selectedPet}
            onSelectPet={setSelectedPet}
          />
        )}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={
              selectedPet === "other"
                ? "Ask a general question..."
                : selectedPet
                ? `Ask about ${selectedPet.name}...`
                : "Select a pet or 'Other' above..."
            }
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              ((!selectedPet && selectedPet !== "other") || isLoading) &&
                styles.disabledSendButton,
            ]}
            onPress={sendMessage}
            disabled={isLoading || (!selectedPet && selectedPet !== "other")}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#6d28d9",
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    flex: 1,
    textAlign: "center",
  },
  petSelectorContainer: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: "100%",
  },
  petBubble: {
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    minWidth: 100,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    paddingHorizontal: 10,
  },
  selectedPetBubble: {
    backgroundColor: "#6d28d9",
  },
  petBubbleText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  selectedPetBubbleText: {
    color: "white",
  },
  messageList: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#6d28d9",
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E7EB",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: "white",
  },
  aiMessageText: {
    color: "#1F2937",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#6d28d9",
    borderRadius: 20,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledSendButton: {
    backgroundColor: "#A78BFA",
  },
});

export default AIChat;
