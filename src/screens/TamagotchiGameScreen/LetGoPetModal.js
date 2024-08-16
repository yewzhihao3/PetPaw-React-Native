import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { getCatImage } from "../../utils/assetManager";

const LetGoPetModal = ({
  isVisible,
  onClose,
  onConfirm,
  petName,
  theme,
  petType,
}) => {
  const getSadPetImage = () => {
    return getCatImage(petType, "sad");
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: theme.background }]}
        >
          <Text style={[styles.title, { color: theme.text }]}>
            Let Go of Pet?
          </Text>
          <Image source={getSadPetImage()} style={styles.petImage} />
          <Text style={[styles.message, { color: theme.text }]}>
            Are you sure you want to let go of {petName}?
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                { borderColor: theme.text },
              ]}
              onPress={onClose}
            >
              <Feather name="x" size={24} color={theme.text} />
              <Text style={[styles.buttonText, { color: theme.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={() => {
                console.log("Confirm button pressed in modal");
                onConfirm();
              }}
            >
              <Feather name="check" size={24} color="#FFFFFF" />
              <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
  },
  title: {
    fontSize: 24,
    fontFamily: "PressStart2P",
    marginBottom: 20,
    textAlign: "center",
  },
  petImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    fontFamily: "PressStart2P",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
    minWidth: 120,
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
  },
  confirmButton: {
    backgroundColor: "#FF6B6B",
  },
  buttonText: {
    fontFamily: "PressStart2P",
    fontSize: 14,
    marginLeft: 5,
  },
});

export default LetGoPetModal;
