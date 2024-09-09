import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import * as Progress from "react-native-progress";
import { API_URL, WS_BASE_URL } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function OrderPreparing() {
  const navigation = useNavigation();
  const route = useRoute();
  const [orderStatus, setOrderStatus] = useState("PENDING");
  const { orderId } = route.params;
  const [showBackMessage, setShowBackMessage] = useState(false);

  const checkOrderStatus = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const orderData = await response.json();
        setOrderStatus(orderData.status);
        if (orderData.status === "RIDER_ACCEPTED") {
          navigation.replace("Delivery", { orderId: orderData.id });
        }
      }
    } catch (error) {
      console.error("Error checking order status:", error);
    }
  }, [orderId, navigation]);

  useEffect(() => {
    const ws = new WebSocket(`${WS_BASE_URL}/ws/orders`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.order_id === orderId) {
        setOrderStatus(data.status);
        if (data.status === "RIDER_ACCEPTED") {
          navigation.replace("Delivery", { orderId: data.order_id });
        }
      }
    };

    const intervalId = setInterval(checkOrderStatus, 5000); // Poll every 5 seconds

    const timeoutId = setTimeout(() => {
      setShowBackMessage(true);
    }, 60000); // Show message after 60 seconds

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      ws.close();
    };
  }, [orderId, navigation, checkOrderStatus]);

  const getStatusMessage = () => {
    switch (orderStatus) {
      case "PENDING":
        return "Waiting for the shop to accept your order!";
      case "ACCEPTED":
        return "Order accepted! Waiting for a rider to pick up your order.";
      case "RIDER_ACCEPTED":
        return "A rider has accepted your order! Preparing for delivery...";
      default:
        return "Processing your order...";
    }
  };

  const handleBackPress = () => {
    navigation.navigate("ECommerce");
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>
      <Animatable.Image
        source={require("../../../assets/E-Commerce/animation.gif")}
        animation="slideInUp"
        iterationCount={1}
        style={styles.image}
      />
      <Animatable.Text
        animation="slideInUp"
        iterationCount={1}
        style={styles.text}
      >
        {getStatusMessage()}
      </Animatable.Text>
      {showBackMessage && (
        <Animatable.Text animation="fadeIn" style={styles.backMessage}>
          Too long? Why not navigate back to your order list to keep track of
          your order
        </Animatable.Text>
      )}
      <Animatable.View
        animation="slideInUp"
        iterationCount={1}
        style={styles.progressContainer}
      >
        <Progress.Circle size={60} indeterminate={true} color="white" />
      </Animatable.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#6d28d9", // Primary purple color
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "#5b21b6", // Slightly darker purple for the button
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  image: {
    width: 300,
    height: 300,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    paddingHorizontal: 20,
    color: "white",
  },
  backMessage: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
    paddingHorizontal: 20,
    color: "white",
  },
  progressContainer: {
    marginTop: 20,
  },
});
