import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Icon from "react-native-feather";
import { useDispatch, useSelector } from "react-redux";
import { selectShop } from "../../slices/eShopslice";
import {
  removeFromCart,
  selectCartItems,
  selectCartTotal,
  emptyCart,
} from "../../slices/cartSlice";
import { urlFor } from "../../../sanity";
import { useECommerceTheme } from "../../../theme/eCommerceTheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createOrder,
  getUserData,
  getUserAddresses,
  fetchLatestOrder,
} from "./EcomapiService";

export default function Cart() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const shop = useSelector(selectShop);
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const [groupedItems, setGroupItems] = useState({});
  const [deliveryTime, setDeliveryTime] = useState("20-30 mins");
  const [deliveryFee, setDeliveryFee] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const theme = useECommerceTheme();

  const deliveryOptions = [
    { time: "20-30 mins", fee: 10 },
    { time: "40-60 mins", fee: 5 },
  ];

  useEffect(() => {
    const items = cartItems.reduce((group, item) => {
      if (group[item._id]) {
        group[item._id].quantity += item.quantity;
      } else {
        group[item._id] = { ...item };
      }
      return group;
    }, {});
    setGroupItems(items);
  }, [cartItems]);

  const handleDeliveryChange = (option) => {
    setDeliveryTime(option.time);
    setDeliveryFee(option.fee);
    setShowModal(false);
  };

  const handleCreateOrder = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("userToken");
      console.log("User ID:", userId);
      console.log("Token:", token);
      const userData = await getUserData(userId, token);
      console.log("User Data:", JSON.stringify(userData));

      if (!userId || !token || !userData) {
        throw new Error("User not authenticated or data not available");
      }

      let deliveryAddressId = await AsyncStorage.getItem("deliveryAddressId");
      console.log("Stored Delivery Address ID:", deliveryAddressId);

      let userAddresses = await getUserAddresses(userId, token);
      console.log("User Addresses:", JSON.stringify(userAddresses));

      if (!userAddresses || userAddresses.length === 0) {
        Alert.alert(
          "No Delivery Address",
          "Please add a delivery address before placing an order.",
          [{ text: "OK", onPress: () => navigation.navigate("AddAddress") }]
        );
        return;
      }

      // If stored address is not found, use the first available address
      if (
        !userAddresses.some((addr) => addr.id.toString() === deliveryAddressId)
      ) {
        deliveryAddressId = userAddresses[0].id.toString();
        await AsyncStorage.setItem("deliveryAddressId", deliveryAddressId);
        console.log(
          "Using first available address. New Delivery Address ID:",
          deliveryAddressId
        );
      }

      const orderData = {
        user_id: parseInt(userId),
        status: "PENDING",
        total_amount: parseFloat((cartTotal + deliveryFee).toFixed(2)),
        customer_name: userData.name,
        customer_email: userData.email,
        customer_phone: userData.phone_number,
        delivery_time: deliveryTime,
        delivery_fee: deliveryFee,
        delivery_address_id: parseInt(deliveryAddressId),
        items: Object.values(groupedItems).map((item) => ({
          product_id: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      console.log("Order data:", JSON.stringify(orderData, null, 2));

      let createdOrder = await createOrder(orderData, token);
      console.log("Order created:", JSON.stringify(createdOrder, null, 2));

      if (createdOrder.id === "pending") {
        try {
          const latestOrder = await fetchLatestOrder(token);
          if (latestOrder) {
            createdOrder = latestOrder;
          }
        } catch (fetchError) {
          console.error("Error fetching latest order:", fetchError);
        }
      }

      dispatch(emptyCart());
      navigation.navigate("OrderPreparing", { orderId: createdOrder.id });
    } catch (error) {
      console.error("Error creating order:", error);
      if (error.response) {
        console.error(
          "Response data:",
          JSON.stringify(error.response.data, null, 2)
        );
        console.error("Response status:", error.response.status);
        console.error(
          "Response headers:",
          JSON.stringify(error.response.headers, null, 2)
        );
      }
      let errorMessage = "Failed to create order. Please try again.";
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }
      Alert.alert("Error", errorMessage);
    }
  };

  if (!shop) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>No shop data available.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: theme.primary }]}
        >
          <Icon.ArrowLeft strokeWidth={3} stroke="white" />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Your cart
          </Text>
          <Text style={[styles.shopName, { color: theme.textSecondary }]}>
            {shop.name}
          </Text>
        </View>
      </View>

      {/* Delivery Section */}
      <View
        style={[
          styles.deliverySection,
          { backgroundColor: theme.cardBackground },
        ]}
      >
        <Image
          source={require("../../../assets/E-Commerce/deliveryguy.png")}
          style={styles.deliveryImage}
        />
        <Text style={[styles.deliveryText, { color: theme.text }]}>
          Deliver in {deliveryTime}
        </Text>
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <Text style={[styles.changeButton, { color: theme.primary }]}>
            Change
          </Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {Object.values(groupedItems).map((item) => (
          <View
            key={item._id}
            style={[
              styles.productRow,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <Text style={[styles.quantity, { color: theme.text }]}>
              {item.quantity} x
            </Text>
            <Image
              style={styles.productImage}
              source={{ uri: urlFor(item.image).url() }}
            />
            <Text style={[styles.productName, { color: theme.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.productPrice, { color: theme.primary }]}>
              RM{item.price}
            </Text>
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: theme.primary }]}
              onPress={() => dispatch(removeFromCart({ _id: item._id }))}
            >
              <Icon.Minus
                strokeWidth={2}
                height={20}
                width={20}
                stroke="white"
              />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Total Section */}
      <View
        style={[styles.totalSection, { backgroundColor: theme.cardBackground }]}
      >
        <View style={styles.row}>
          <Text style={[styles.totalText, { color: theme.text }]}>
            Subtotal
          </Text>
          <Text style={[styles.totalAmount, { color: theme.text }]}>
            RM{cartTotal.toFixed(2)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.totalText, { color: theme.text }]}>
            Delivery fee
          </Text>
          <Text style={[styles.totalAmount, { color: theme.text }]}>
            RM {deliveryFee.toFixed(2)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.totalText, styles.bold, { color: theme.text }]}>
            Total
          </Text>
          <Text
            style={[styles.totalAmount, styles.bold, { color: theme.primary }]}
          >
            RM{(cartTotal + deliveryFee).toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.placeOrderButton, { backgroundColor: theme.primary }]}
          onPress={handleCreateOrder}
        >
          <Text style={styles.placeOrderText}>Place Order</Text>
        </TouchableOpacity>
      </View>

      {/* Delivery Options Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Select Delivery Time
            </Text>
            {deliveryOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionButton}
                onPress={() => handleDeliveryChange(option)}
              >
                <Text style={[styles.optionText, { color: theme.text }]}>
                  {option.time} - RM{option.fee}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  shopName: {
    fontSize: 16,
  },
  deliverySection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginVertical: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  deliveryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  deliveryText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
  },
  changeButton: {
    fontWeight: "bold",
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  quantity: {
    fontWeight: "bold",
    marginRight: 8,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  productName: {
    flex: 1,
    fontSize: 16,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 16,
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
  },
  totalSection: {
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalText: {
    fontSize: 16,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  bold: {
    fontWeight: "bold",
  },
  placeOrderButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  placeOrderText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  optionButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  optionText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
