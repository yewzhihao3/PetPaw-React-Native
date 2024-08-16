// DeliveredOrderModal.js
import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import * as Icon from "react-native-feather";

const DeliveredOrderModal = ({
  isVisible,
  onClose,
  order,
  riderInfo,
  products,
}) => {
  if (!order) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon.X stroke="#5B21B6" width={24} height={24} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Order Details</Text>

          <Text style={styles.sectionTitle}>Rider Information</Text>
          <Text style={styles.infoText}>Name: {riderInfo?.name || "N/A"}</Text>
          <Text style={styles.infoText}>
            Phone: {riderInfo?.phone_number || "N/A"}
          </Text>

          <Text style={styles.sectionTitle}>Purchased Items</Text>
          <ScrollView style={styles.itemList}>
            {order.items &&
              order.items.map((item, index) => (
                <View key={index} style={styles.item}>
                  <Text style={styles.itemName}>
                    {products[item.product_id] || "Unknown Product"}
                  </Text>
                  <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                  <Text style={styles.itemPrice}>
                    RM {(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}
          </ScrollView>

          <Text style={styles.total}>
            Total: RM {order.total_amount.toFixed(2)}
          </Text>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#5B21B6",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
    color: "#4A5568",
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
    color: "#2D3748",
  },
  itemList: {
    maxHeight: 200,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  itemName: {
    flex: 2,
    fontSize: 16,
  },
  itemQuantity: {
    flex: 1,
    fontSize: 16,
    textAlign: "center",
  },
  itemPrice: {
    flex: 1,
    fontSize: 16,
    textAlign: "right",
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "right",
    color: "#5B21B6",
  },
});

export default DeliveredOrderModal;
