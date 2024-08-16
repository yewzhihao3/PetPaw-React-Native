import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import BottomSheet from "./BottomSheet";

const DriverOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  useEffect(() => {
    // Fetch active orders when backend is implemented
  }, []);

  const handleOrderPress = (order) => {
    setSelectedOrder(order);
    setIsBottomSheetVisible(true);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    // Update order status in the backend when implemented
    console.log(`Updating order ${orderId} to status: ${newStatus}`);
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>Order #{item.id}</Text>
        <Text
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          {item.status}
        </Text>
      </View>
      <Text style={styles.orderDetails}>{item.pickup_address}</Text>
      <Text style={styles.orderDetails}>{item.dropoff_address}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Orders</Text>
      </View>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="clipboard-text-outline" size={80} color="#5E17EB" />
            <Text style={styles.emptyStateText}>
              No active orders at the moment
            </Text>
          </View>
        }
      />
      <BottomSheet
        isVisible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
        order={selectedOrder}
        handleUpdateStatus={handleUpdateStatus}
      />
    </SafeAreaView>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case "ACCEPTED":
      return "#FFA500";
    case "PICKED_UP":
      return "#4CAF50";
    case "IN_PROGRESS":
      return "#2196F3";
    default:
      return "#757575";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    backgroundColor: "#5E17EB",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  orderItem: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    color: "#fff",
  },
  orderDetails: {
    color: "#666",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 18,
    color: "#666",
    marginTop: 10,
  },
});

export default DriverOrders;
