import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import * as Progress from "react-native-progress";
import { useECommerceTheme } from "../../../theme/eCommerceTheme";
import { API_URL } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OrderPreparing() {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useECommerceTheme();
  const [orderStatus, setOrderStatus] = useState("PENDING");
  const { orderId } = route.params;

  useEffect(() => {
    const timer = setTimeout(() => {
      setOrderStatus("ACCEPTED");
    }, 10000);

    const riderTimer = setTimeout(() => {
      setOrderStatus("RIDER_ACCEPTED");
      navigateToDelivery();
    }, 20000);

    return () => {
      clearTimeout(timer);
      clearTimeout(riderTimer);
    };
  }, []);

  const navigateToDelivery = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const orderResponse = await fetch(`${API_URL}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (orderResponse.ok) {
        const orderData = await orderResponse.json();
        navigation.replace("Delivery", { order: orderData });
      } else {
        console.error("Failed to fetch order data");
        navigation.replace("Delivery", { orderId: orderId });
      }
    } catch (error) {
      console.error("Error fetching order data:", error);
      navigation.replace("Delivery", { orderId: orderId });
    }
  };

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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.primary }]}
    >
      <Animatable.Image
        source={require("../../../assets/E-Commerce/animation.gif")}
        animation="slideInUp"
        iterationCount={1}
        style={styles.image}
      />
      <Animatable.Text
        animation="slideInUp"
        iterationCount={1}
        style={[styles.text, { color: theme.buttonText }]}
      >
        {getStatusMessage()}
      </Animatable.Text>
      <Animatable.View
        animation="slideInUp"
        iterationCount={1}
        style={styles.progressContainer}
      >
        <Progress.Circle
          size={60}
          indeterminate={true}
          color={theme.buttonText}
        />
      </Animatable.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  },
  progressContainer: {
    marginTop: 20,
  },
});
