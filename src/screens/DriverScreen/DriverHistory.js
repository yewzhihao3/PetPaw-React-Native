import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, SafeAreaView } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const DriverHistory = () => {
  const [orderHistory, setOrderHistory] = useState([]);

  useEffect(() => {
    // Fetch order history when backend is implemented
  }, []);

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyHeader}>
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
      <Text style={styles.historyDetails}>{item.pickup_address}</Text>
      <Text style={styles.historyDetails}>{item.dropoff_address}</Text>
      <Text style={styles.historyDetails}>
        Earnings: ${item.earnings.toFixed(2)}
      </Text>
      <Text style={styles.historyDate}>
        {new Date(item.completed_at).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order History</Text>
      </View>
      <FlatList
        data={orderHistory}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="history" size={80} color="#5E17EB" />
            <Text style={styles.emptyStateText}>
              No order history available
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case "COMPLETED":
      return "#4CAF50";
    case "CANCELLED":
      return "#F44336";
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
  historyItem: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  historyHeader: {
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
  historyDetails: {
    color: "#666",
    marginBottom: 5,
  },
  historyDate: {
    color: "#999",
    fontSize: 12,
    marginTop: 5,
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

export default DriverHistory;
