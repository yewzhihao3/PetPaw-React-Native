import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRiderLocation } from "./RiderLocationContext";

const LocationUpdateNotification = () => {
  const { manualLocationUpdate } = useRiderLocation();
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await manualLocationUpdate();
      // You could add a success message here if you want
    } catch (error) {
      console.error("Failed to update location:", error);
      // You could add an error message here if you want
    } finally {
      setUpdating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Update your location for accurate delivery tracking
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={handleUpdate}
        disabled={updating}
      >
        {updating ? (
          <ActivityIndicator color="#5E17EB" />
        ) : (
          <Text style={styles.buttonText}>Update Location</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#5E17EB",
    padding: 15,
    borderRadius: 10,
    margin: 10,
  },
  text: {
    color: "white",
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#5E17EB",
    fontWeight: "bold",
  },
});

export default LocationUpdateNotification;
