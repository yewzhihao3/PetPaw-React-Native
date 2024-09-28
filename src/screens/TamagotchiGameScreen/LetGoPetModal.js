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

const LetGoPetModal = ({
  isVisible,
  onClose,
  onConfirm,
  virtualPetName,
  petType,
  getVirtualPetImage,
}) => {
  const sadPetImage = getVirtualPetImage({ type: petType }, "sad");

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Let Go of Pet?</Text>
          <Image source={sadPetImage} style={styles.petImage} />
          <Text style={styles.modalText}>
            Are you sure you want to let go of {virtualPetName}?
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={onClose}>
              <Feather name="x" size={24} color="#ffffff" />
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonDanger]}
              onPress={onConfirm}
            >
              <Feather name="check" size={24} color="#ffffff" />
              <Text style={styles.modalButtonText}>Confirm</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "PressStart2P",
    color: "#6d28d9",
    marginBottom: 10,
  },
  petImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    fontFamily: "PressStart2P",
    color: "#6d28d9",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#6d28d9",
    minWidth: 100,
  },
  modalButtonDanger: {
    backgroundColor: "#ef4444",
  },
  modalButtonText: {
    color: "#ffffff",
    fontFamily: "PressStart2P",
    fontSize: 14,
    marginLeft: 5,
  },
});

export default LetGoPetModal;
