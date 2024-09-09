// Delivery.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Icon from "react-native-feather";
import { useDispatch } from "react-redux";
import { emptyCart } from "../../slices/cartSlice";
import { clearShop } from "../../slices/eShopslice";
import OrderMapView from "./OrderMapView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchOrderById,
  fetchProducts,
  getRiderData,
  fetchRiderLocation,
} from "./EcomapiService";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function Delivery() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState({});
  const [riderInfo, setRiderInfo] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRiderData = useCallback(async (riderId) => {
    try {
      console.log("Fetching rider data for rider ID:", riderId);
      const token = await AsyncStorage.getItem("userToken");
      const riderData = await getRiderData(riderId, token);
      console.log("Fetched rider data:", riderData);
      setRiderInfo(riderData);
    } catch (error) {
      console.error("Error fetching rider data:", error);
      setRiderInfo(null);
    }
  }, []);

  const fetchProductData = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const productsData = await fetchProducts(token);
      console.log("Fetched products data:", productsData);
      const productMap = {};
      productsData.forEach((product) => {
        productMap[product.sanity_id] = product.name;
      });
      setProducts(productMap);
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }, []);

  const fetchRiderLocationUpdate = useCallback(async () => {
    if (order?.rider_id) {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const location = await fetchRiderLocation(order.rider_id, token);
        console.log("Fetched rider location:", location);

        if (location && location.latitude !== 0 && location.longitude !== 0) {
          setRiderLocation(location);
        } else {
          console.log("No valid location data available for rider.");
          setRiderLocation(null);
        }
      } catch (error) {
        console.error("Error fetching rider location:", error);
        setRiderLocation(null);
      }
    }
  }, [order?.rider_id]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        console.log("Route params:", route.params);

        if (route.params?.orderId) {
          const token = await AsyncStorage.getItem("userToken");
          const fullOrderData = await fetchOrderById(
            route.params.orderId,
            token
          );
          setOrder(fullOrderData);
          if (fullOrderData.rider_id) {
            await fetchRiderData(fullOrderData.rider_id);
          } else {
            setRiderInfo(null);
          }
        }
        await fetchProductData();
        await fetchRiderLocationUpdate();
      } catch (error) {
        console.error("Error fetching initial data:", error);
        Alert.alert("Error", "Failed to load order data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [
    route.params,
    fetchRiderData,
    fetchProductData,
    fetchRiderLocationUpdate,
  ]);

  useEffect(() => {
    const locationInterval = setInterval(fetchRiderLocationUpdate, 10000); // Update every 10 seconds
    return () => clearInterval(locationInterval);
  }, [fetchRiderLocationUpdate]);

  const closeDelivery = useCallback(() => {
    navigation.navigate("ECommerce");
    dispatch(emptyCart());
    dispatch(clearShop());
  }, [navigation, dispatch]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5B21B6" />
        <Text>Loading order data...</Text>
      </View>
    );
  }

  if (!order || !order.items) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error loading order data. Please try again.</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const riderName = riderInfo?.name || "Rider Name Not Available";
  const riderNumberPlate = riderInfo?.number_plate || "N/A";
  const riderStatus =
    order.status === "ON_THE_WAY"
      ? "Rider is on the way"
      : order.status === "RIDER_ACCEPTED"
      ? "Rider has accepted your order"
      : "Preparing your order";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mapContainer}>
          <OrderMapView
            order={order}
            riderLocation={riderLocation}
            onClose={closeDelivery}
          />
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.estimatedArrivalContainer}>
            <View>
              <Text style={styles.estimatedArrivalTitle}>
                Estimated Arrival
              </Text>
              <Text style={styles.estimatedArrivalTime}>
                {order.delivery_time || "Calculating..."}
              </Text>
              <Text style={styles.orderStatus}>{riderStatus}</Text>
            </View>
            <Image
              style={styles.deliveryImage}
              source={require("../../../assets/E-Commerce/bike2.gif")}
            />
          </View>
          <View style={styles.riderContainer}>
            {riderInfo?.image_url ? (
              <Image
                style={styles.riderImage}
                source={{ uri: riderInfo.image_url }}
                onError={(e) => {
                  console.log(
                    "Error loading rider image:",
                    e.nativeEvent.error
                  );
                }}
              />
            ) : (
              <View style={[styles.riderImage, styles.placeholderContainer]}>
                <Icon.User
                  stroke="white"
                  fill="#5B21B6"
                  width={40}
                  height={40}
                />
              </View>
            )}
            <View style={styles.riderInfo}>
              <Text style={styles.riderName}>{riderName}</Text>
              <Text style={styles.riderStatus}>{riderStatus}</Text>
              <View style={styles.numberPlateContainer}>
                <Text style={styles.numberPlate}>{riderNumberPlate}</Text>
              </View>
            </View>
          </View>
          <View style={styles.orderDetails}>
            <Text style={styles.orderDetailsTitle}>Order Details</Text>
            {order.items.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <Text style={styles.itemName}>
                  {products[item.product_id] || "Loading..."}
                </Text>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                <Text style={styles.itemPrice}>
                  RM {(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Subtotal</Text>
              <Text style={styles.totalAmount}>
                RM {(order.total_amount - order.delivery_fee).toFixed(2)}
              </Text>
            </View>
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Delivery Fee</Text>
              <Text style={styles.totalAmount}>
                RM {order.delivery_fee.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.totalContainer, styles.grandTotal]}>
              <Text style={[styles.totalText, styles.grandTotalText]}>
                Total
              </Text>
              <Text style={[styles.totalAmount, styles.grandTotalAmount]}>
                RM {order.total_amount.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scrollContent: {
    flexGrow: 1,
  },
  mapContainer: {
    height: SCREEN_HEIGHT * 0.6,
    position: "relative",
  },
  infoContainer: {
    padding: 10,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 80,
  },
  estimatedArrivalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  estimatedArrivalTitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  estimatedArrivalTime: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#5B21B6",
    marginVertical: 5,
  },
  orderStatus: {
    fontSize: 14,
    color: "#6B7280",
  },
  deliveryImage: {
    width: 80,
    height: 80,
  },
  riderContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5B21B6",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  riderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "white",
  },
  riderInfo: {
    flex: 1,
  },
  riderName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  riderStatus: {
    color: "white",
    fontSize: 14,
    opacity: 0.9,
  },
  numberPlateContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  numberPlate: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  orderDetails: {
    marginTop: 20,
  },
  orderDetailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#374151",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  itemName: {
    flex: 2,
    fontSize: 16,
    color: "#4B5563",
  },
  itemQuantity: {
    flex: 1,
    fontSize: 16,
    textAlign: "center",
    color: "#6B7280",
  },
  itemPrice: {
    flex: 1,
    fontSize: 16,
    textAlign: "right",
    color: "#374151",
    fontWeight: "500",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  totalText: {
    fontSize: 16,
    color: "#4B5563",
  },
  totalAmount: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  grandTotal: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  grandTotalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  grandTotalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5B21B6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 20,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#5B21B6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  riderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "white",
  },
  placeholderContainer: {
    backgroundColor: "#5B21B6",
    justifyContent: "center",
    alignItems: "center",
  },
});
