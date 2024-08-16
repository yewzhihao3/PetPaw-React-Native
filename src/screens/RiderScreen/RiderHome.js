import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  Switch,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  getRiderData,
  getStoredRiderData,
  fetchOrders,
  fetchOrderHistory,
} from "../API/apiService";
import { useRiderStatus } from "./RiderStatusContext";
import { LocationNotificationManager } from "./LocationNotificationManager";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const RiderHome = () => {
  const navigation = useNavigation();
  const { isOnline, setIsOnline } = useRiderStatus();
  const [riderData, setRiderData] = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const { token, riderId } = await getStoredRiderData();
      if (!riderId || !token) {
        throw new Error("Rider ID or token not found");
      }

      const data = await getRiderData(riderId, token);
      setRiderData(data);

      const orders = await fetchOrders(token);
      console.log("Fetched orders:", orders);

      const activeOrders = orders.filter((order) =>
        ["ACCEPTED", "RIDER_ACCEPTED", "ON_THE_WAY"].includes(order.status)
      );
      console.log("Active orders:", activeOrders);

      const completedOrders = orders.filter(
        (order) => order.status === "DELIVERED"
      );

      setPendingOrders(activeOrders);
      setRecentTransactions(completedOrders.slice(0, 2));

      // Fetch order history
      const history = await fetchOrderHistory(token, riderId);
      setOrderHistory(history);

      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const updateNotifications = async () => {
      if (isOnline) {
        await LocationNotificationManager.setupNotification();
      } else {
        await LocationNotificationManager.cancelNotification();
      }
    };

    updateNotifications();
  }, [isOnline]);

  const calculateTotalEarnings = () => {
    return orderHistory.reduce(
      (total, order) => total + (order.rider_earnings || 0),
      0
    );
  };

  const handleToggleOnline = async (value) => {
    setIsOnline(value);
    try {
      if (value) {
        await LocationNotificationManager.setupNotification();
      } else {
        await LocationNotificationManager.cancelNotification();
      }
    } catch (error) {
      console.error("Error toggling online status:", error);
      Alert.alert("Error", "Failed to update online status. Please try again.");
    }
  };

  const handleViewOrders = () => {
    if (isOnline) {
      navigation.navigate("Orders");
    } else {
      Alert.alert(
        "Offline Status",
        "You need to be online to view orders. Would you like to go online?",
        [
          { text: "No", style: "cancel" },
          { text: "Yes", onPress: () => handleToggleOnline(true) },
        ]
      );
    }
  };

  const handleViewHistory = () => {
    navigation.navigate("History");
  };

  const handleRefresh = () => {
    fetchData();
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerTextContent}>
              <Text style={styles.name}>
                {riderData ? riderData.name : "Loading..."}
              </Text>
              <Text style={styles.earningsLabel}>YOUR EARNINGS</Text>
              <Text style={styles.earnings}>
                RM{calculateTotalEarnings().toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity onPress={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? (
                <ActivityIndicator size="large" color="#ffffff" />
              ) : (
                <Image
                  source={require("../../../assets/E-Commerce/rider-image.png")}
                  style={styles.headerImage}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Online/Offline Toggle */}
        <View style={styles.card}>
          <View>
            <Text style={styles.statusText}>
              Status: {isOnline ? "Online" : "Offline"}
            </Text>
            <Text style={styles.statusSubtext}>
              {isOnline ? "Open to any delivery." : "You're offline"}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            trackColor={{ false: "#767577", true: "#5E17EB" }}
            thumbColor={isOnline ? "#ffffff" : "#f4f3f4"}
          />
        </View>

        {/* Available Orders */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="package-variant" size={24} color="#5E17EB" />
            <Text style={styles.cardTitle}>
              {pendingOrders.length} delivery orders found!
            </Text>
          </View>
          <Text style={styles.cardSubtitle}>Rush hour, be careful.</Text>
          <TouchableOpacity
            style={styles.cardButton}
            onPress={handleViewOrders}
          >
            <Text style={styles.cardButtonText}>View details</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={handleViewHistory}
            >
              <Text style={styles.viewAllButtonText}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentTransactions.map((transaction, index) => (
            <View key={index} style={styles.transaction}>
              <Icon name="bike" size={24} color="#5E17EB" />
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>
                  Order #{transaction.id}
                </Text>
                <Text style={styles.transactionSubtitle}>
                  {new Date(transaction.created_at).toLocaleString()}
                </Text>
              </View>
              <View style={styles.transactionAmount}>
                <Text style={styles.amountText}>
                  +RM{transaction.rider_earnings.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Top Performing Areas */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Top Performing Areas</Text>
          <View style={styles.areaList}>
            <Text style={styles.areaItem}>1. Taiping - RM75.20/hr</Text>
            <Text style={styles.areaItem}>2. Kampar - RM98.75/hr</Text>
            <Text style={styles.areaItem}>3. Selangor - RM170.90/hr</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    backgroundColor: "#5E17EB",
    height: height * 0.3,
    marginHorizontal: -16,
    padding: 20,
    justifyContent: "center",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextContent: {
    flex: 1,
  },
  headerImage: {
    width: width * 0.25,
    height: width * 0.25,
    resizeMode: "contain",
  },
  name: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  earnings: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
  },
  earningsLabel: {
    color: "white",
    fontSize: 16,
    marginTop: 10,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 14,
    color: "gray",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "red",
    marginBottom: 10,
  },
  cardButton: {
    backgroundColor: "#5E17EB",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  cardButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  viewAllButton: {
    backgroundColor: "#5E17EB",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  viewAllButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  transaction: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 15,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  transactionSubtitle: {
    fontSize: 14,
    color: "gray",
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "green",
  },
  areaList: {
    marginTop: 10,
  },
  areaItem: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#5E17EB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default RiderHome;
