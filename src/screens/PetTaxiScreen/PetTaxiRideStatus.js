// PetTaxiRideStatus.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Icon from "react-native-feather";

const PetTaxiRideStatus = ({ status }) => {
  const getStatusInfo = () => {
    switch (status) {
      case "PENDING":
        return { icon: "clock", color: "#FFA500", text: "Waiting for driver" };
      case "ACCEPTED":
        return {
          icon: "check-circle",
          color: "#4CAF50",
          text: "Driver accepted",
        };
      case "IN_PROGRESS":
        return { icon: "navigation", color: "#2196F3", text: "On the way" };
      case "COMPLETED":
        return { icon: "flag", color: "#4CAF50", text: "Ride completed" };
      case "CANCELLED":
        return { icon: "x-circle", color: "#F44336", text: "Ride cancelled" };
      default:
        return {
          icon: "help-circle",
          color: "#757575",
          text: "Unknown status",
        };
    }
  };

  const { icon, color, text } = getStatusInfo();

  return (
    <View style={styles.container}>
      <Icon.Feather name={icon} size={24} color={color} />
      <Text style={[styles.statusText, { color }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PetTaxiRideStatus;
