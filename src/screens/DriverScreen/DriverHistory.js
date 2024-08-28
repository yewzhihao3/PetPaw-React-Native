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
import { getDriverTransactions, getStoredDriverData } from "../API/apiService";

const DriverHistory = () => {
  const [rideHistory, setRideHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRideHistory = useCallback(async () => {
    try {
      setLoading(true);
      const { token, driverId } = await getStoredDriverData();
      if (!token || !driverId) {
        console.error("Driver not logged in");
        return;
      }
      const history = await getDriverTransactions(driverId, token);
      setRideHistory(history);
    } catch (error) {
      console.error("Error fetching ride history:", error);
      Alert.alert("Error", "Failed to load ride history. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRideHistory();
  }, [loadRideHistory]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date)
      ? date.toLocaleDateString() + " " + date.toLocaleTimeString()
      : "Invalid Date";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "#4CAF50"; // Green
      case "CANCELLED":
        return "#F44336"; // Red
      default:
        return "#757575"; // Grey
    }
  };

  const renderRideItem = ({ item }) => (
    <View style={styles.rideItem}>
      <View style={styles.rideHeader}>
        <Text style={styles.rideNumber}>
          Ride #{item.id.toString().padStart(5, "0")}
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
      <View style={styles.rideDetails}>
        <Icon name="calendar" size={20} color="#5E17EB" style={styles.icon} />
        <Text style={styles.rideDate}>{formatDate(item.created_at)}</Text>
      </View>
      <View style={styles.rideDetails}>
        <Icon name="account" size={20} color="#5E17EB" style={styles.icon} />
        <Text style={styles.customerName}>{item.customer_name}</Text>
      </View>
      <View style={styles.rideDetails}>
        <Icon name="cash" size={20} color="#5E17EB" style={styles.icon} />
        <Text style={styles.rideAmount}>
          {item.status === "COMPLETED"
            ? `Earnings: RM${item.fare.toFixed(2)}`
            : `Ride Total: RM${item.total_amount.toFixed(2)}`}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5E17EB" />
      <View style={styles.header}>
        <Text style={styles.title}>Ride History</Text>
        <TouchableOpacity
          onPress={loadRideHistory}
          style={styles.refreshButton}
        >
          <Icon name="refresh" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading ride history...</Text>
        </View>
      ) : (
        <FlatList
          data={rideHistory}
          renderItem={renderRideItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.rideList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="history" size={80} color="#5E17EB" />
              <Text style={styles.emptyStateText}>No completed rides yet</Text>
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
    backgroundColor: "#FFFFFF",
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
  rideList: {
    padding: 16,
  },
  rideItem: {
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
  rideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rideNumber: {
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
  rideDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  rideDate: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  rideAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5E17EB",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#333",
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

export default DriverHistory;
