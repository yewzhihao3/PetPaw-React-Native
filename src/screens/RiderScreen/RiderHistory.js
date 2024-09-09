import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { fetchOrderHistory } from "./RiderapiService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const COMPLETED_ORDER_STATUSES = ["DELIVERED", "CANCELLED"];

const RiderHistory = () => {
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderHistory();
  }, []);

  const loadOrderHistory = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const riderId = await AsyncStorage.getItem("userId");
      if (!token || !riderId) {
        console.error("User not logged in");
        return;
      }

      const history = await fetchOrderHistory(token, riderId);
      setOrderHistory(history);
    } catch (error) {
      console.error("Error fetching order history:", error);
      Alert.alert("Error", "Failed to load order history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date)
      ? date.toLocaleDateString() + " " + date.toLocaleTimeString()
      : "Invalid Date";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "DELIVERED":
        return "#4CAF50"; // Green
      case "CANCELLED":
        return "#F44336"; // Red
      default:
        return "#757575"; // Grey
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>
          Order #{item.id.toString().padStart(5, "0")}
        </Text>
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
        <Icon name="calendar" size={20} color="#5E17EB" style={styles.icon} />
        <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
      </View>
      <View style={styles.orderDetails}>
        <Icon name="account" size={20} color="#5E17EB" style={styles.icon} />
        <Text style={styles.customerName}>{item.customer_name}</Text>
      </View>
      <View style={styles.orderDetails}>
        <Icon name="cash" size={20} color="#5E17EB" style={styles.icon} />
        <Text style={styles.orderAmount}>
          {item.status === "DELIVERED"
            ? `Earnings: RM${item.rider_earnings.toFixed(2)}`
            : `Order Total: RM${item.total_amount.toFixed(2)}`}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5E17EB" />
      <View style={styles.header}>
        <Text style={styles.title}>Delivery History</Text>
        <TouchableOpacity
          onPress={loadOrderHistory}
          style={styles.refreshButton}
        >
          <Icon name="refresh" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.centered}>
          <Text>Loading order history...</Text>
        </View>
      ) : (
        <FlatList
          data={orderHistory}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.orderList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="history" size={80} color="#5E17EB" />
              <Text style={styles.emptyStateText}>
                No completed deliveries yet
              </Text>
            </View>
          }
        />
      )}
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
  orderDate: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5E17EB",
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

export default RiderHistory;
