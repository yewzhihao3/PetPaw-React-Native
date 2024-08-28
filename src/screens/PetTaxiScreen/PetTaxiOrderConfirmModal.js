// PetTaxiOrderConfirmModal.js

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";

const PetTaxiOrderConfirmModal = ({
  visible,
  orderData,
  onConfirm,
  onCancel,
}) => {
  if (!orderData) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Confirm Your Order</Text>
          <Text style={styles.modalText}>
            Pickup: {orderData.pickup_location}
          </Text>
          <Text style={styles.modalText}>
            Dropoff: {orderData.dropoff_location}
          </Text>
          <Text style={styles.modalText}>Pet Type: {orderData.pet_type}</Text>
          <Text style={styles.modalText}>
            Distance: {orderData.distance.toFixed(2)} km
          </Text>
          <Text style={styles.modalText}>
            Fare: RM{orderData.fare.toFixed(2)}
          </Text>
          <Text style={styles.modalText}>
            Special Instructions: {orderData.special_instructions || "None"}
          </Text>
          <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
            <Text style={styles.confirmButtonText}>Confirm Order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#5B21B6",
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#4A5568",
  },
  confirmButton: {
    backgroundColor: "#5B21B6",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#E2E8F0",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#4A5568",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default PetTaxiOrderConfirmModal;
