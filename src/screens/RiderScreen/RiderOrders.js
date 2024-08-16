import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StyleSheet,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  fetchOrders,
  fetchProducts,
  updateOrderStatus,
  updateRiderLocation,
} from "../API/apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomSheet from "./BottomSheet";
import { LocationNotificationManager } from "./LocationNotificationManager";
import { useRiderStatus } from "./RiderStatusContext";

const ACTIVE_ORDER_STATUSES = ["ACCEPTED", "RIDER_ACCEPTED", "ON_THE_WAY"];

const RiderOrders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isOnline } = useRiderStatus();

  useEffect(() => {
    loadOrders();
    loadProducts();

    const setupNotificationIfNeeded = async () => {
      const isActive = await LocationNotificationManager.isNotificationActive();
      if (!isActive && isOnline) {
        await LocationNotificationManager.setupNotification();
      }
    };

    setupNotificationIfNeeded();

    return () => {
      // Don't cancel notifications here, as we want them to continue even when leaving this screen
    };
  }, [isOnline]);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "You are not logged in");
        return;
      }

      const fetchedOrders = await fetchOrders(token);
      console.log("Fetched orders:", fetchedOrders);

      const activeOrders = fetchedOrders.filter((order) =>
        ACTIVE_ORDER_STATUSES.includes(order.status)
      );

      setOrders(activeOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      Alert.alert("Error", "Failed to fetch orders: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "You are not logged in");
        return;
      }
      const fetchedProducts = await fetchProducts(token);
      const productMap = {};
      fetchedProducts.forEach((product) => {
        productMap[product.sanity_id] = product;
      });
      setProducts(productMap);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, []);

  const handleUpdateStatus = useCallback(async (orderId, newStatus) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const riderId = await AsyncStorage.getItem("userId");
      if (!token || !riderId) {
        Alert.alert("Error", "You are not logged in");
        return;
      }

      const location = await LocationNotificationManager.updateLocation();

      const statusUpdate = {
        status: newStatus,
        rider_id: parseInt(riderId),
      };

      console.log("Sending status update:", JSON.stringify(statusUpdate));

      const updatedOrder = await updateOrderStatus(
        orderId,
        {
          status: newStatus,
          rider_id: parseInt(riderId),
        },
        token
      );

      if (newStatus === "RIDER_ACCEPTED" && location) {
        await updateRiderLocation(
          riderId,
          location.coords.latitude,
          location.coords.longitude,
          token
        );
      }

      console.log("Received updated order:", JSON.stringify(updatedOrder));

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, ...updatedOrder } : order
        )
      );

      setSelectedOrder(updatedOrder);
      setIsBottomSheetVisible(false);

      Alert.alert("Success", `Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      Alert.alert("Error", "Failed to update order status. Please try again.");
    }
  }, []);

  const handleManualLocationUpdate = useCallback(async () => {
    try {
      const location = await LocationNotificationManager.updateLocation();
      console.log("Location from LocationNotificationManager:", location);
      if (location) {
        const token = await AsyncStorage.getItem("userToken");
        const riderId = await AsyncStorage.getItem("userId");
        if (!token || !riderId) {
          Alert.alert("Error", "You are not logged in");
          return;
        }
        console.log("Updating rider location with:", {
          riderId,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          token,
        });
        const result = await updateRiderLocation(
          riderId,
          location.coords.latitude,
          location.coords.longitude,
          token
        );
        console.log("Update rider location result:", result);
        Alert.alert("Success", "Your location has been updated.");
      } else {
        Alert.alert("Error", "Failed to get current location.");
      }
    } catch (error) {
      console.error("Error updating location:", error);
      Alert.alert("Error", "Failed to update location. Please try again.");
    }
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "ACCEPTED":
        return "#FFA500"; // Orange
      case "RIDER_ACCEPTED":
        return "#4CAF50"; // Green
      case "ON_THE_WAY":
        return "#2196F3"; // Blue
      default:
        return "#757575"; // Grey
    }
  };

  const renderOrderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.orderItem}
        onPress={() => {
          setSelectedOrder(item);
          setIsBottomSheetVisible(true);
        }}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>Order #{item.id}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.orderDetails}>
          <Icon name="cash" size={20} color="#5E17EB" style={styles.icon} />
          <Text style={styles.orderAmount}>
            RM{item.total_amount.toFixed(2)}
          </Text>
        </View>
        <View style={styles.orderDetails}>
          <Icon
            name="map-marker"
            size={20}
            color="#5E17EB"
            style={styles.icon}
          />
          <Text style={styles.orderAddress} numberOfLines={1}>
            {item.delivery_address?.address_line1 || "Address not available"}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5E17EB" />
      <View style={styles.header}>
        <Text style={styles.title}>Active Orders</Text>
        <TouchableOpacity onPress={loadOrders} style={styles.refreshButton}>
          <Icon name="refresh" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.updateLocationButton}
        onPress={handleManualLocationUpdate}
      >
        <Icon
          name="crosshairs-gps"
          size={20}
          color="#FFFFFF"
          style={styles.buttonIcon}
        />
        <Text style={styles.updateLocationButtonText}>Update Location</Text>
      </TouchableOpacity>
      {loading ? (
        <View style={styles.centered}>
          <Text>Loading orders...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.orderList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="clipboard-text-outline" size={80} color="#5E17EB" />
              <Text style={styles.emptyStateText}>
                No active orders at the moment
              </Text>
            </View>
          }
        />
      )}
      <BottomSheet
        isVisible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
        order={selectedOrder}
        products={products}
        handleUpdateStatus={handleUpdateStatus}
        onRefresh={loadOrders}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8FF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#5E17EB",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  refreshButton: {
    padding: 8,
  },
  updateLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7B3FF2",
    padding: 12,
    margin: 16,
    borderRadius: 8,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  updateLocationButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  orderList: {
    padding: 16,
  },
  orderItem: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  orderDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5E17EB",
  },
  orderAddress: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: "#5E17EB",
    textAlign: "center",
    marginTop: 16,
  },
});

export default RiderOrders;
