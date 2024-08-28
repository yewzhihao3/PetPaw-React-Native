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
import { useNavigation } from "@react-navigation/native";
import {
  getDriverData,
  getStoredDriverData,
  updateDriverStatus,
  getPendingRides,
  getDriverTransactions,
} from "../API/apiService";
import { useDriverStatus } from "./DriverStatusContext";

const { width, height } = Dimensions.get("window");

const DriverHome = () => {
  const navigation = useNavigation();
  const { isOnline, setIsOnline } = useDriverStatus();
  const [driverData, setDriverData] = useState(null);
  const [pendingRides, setPendingRides] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const { token, driverId } = await getStoredDriverData();
      if (!driverId || !token) {
        throw new Error("Driver ID or token not found");
      }
      const data = await getDriverData(driverId, token);
      setDriverData(data);
      setIsOnline(data.status === "AVAILABLE");

      const rides = await getPendingRides(token);
      setPendingRides(rides);

      const transactions = await getDriverTransactions(driverId, token);
      setRecentTransactions(transactions.slice(0, 2));

      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
    } finally {
      setIsRefreshing(false);
    }
  }, [setIsOnline]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleOnline = async (value) => {
    try {
      const { token, driverId } = await getStoredDriverData();
      const newStatus = value ? "AVAILABLE" : "OFFLINE";
      await updateDriverStatus(driverId, newStatus, token);
      setIsOnline(value);
      fetchData();
    } catch (error) {
      console.error("Error updating driver status:", error);
      Alert.alert("Error", "Failed to update status. Please try again.");
    }
  };

  const handleViewRides = () => {
    if (isOnline) {
      navigation.navigate("Rides");
    } else {
      Alert.alert(
        "Offline Status",
        "You need to be online to view rides. Would you like to go online?",
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.name}>
                Partner {driverData ? driverData.name : "Driver"}
              </Text>
              <Text style={styles.earningsLabel}>YOUR EARNINGS</Text>
              <Text style={styles.earnings}>
                RM{driverData ? driverData.total_earnings.toFixed(2) : "0.00"}
              </Text>
            </View>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>PetPaw Courier</Text>
              <Icon name="bike-fast" size={24} color="white" />
            </View>
          </View>
        </View>
        <View style={styles.card}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              Status: {isOnline ? "Online" : "Offline"}
            </Text>
            <Text style={styles.statusSubtext}>
              {isOnline ? "You're online" : "You're offline"}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            trackColor={{ false: "#767577", true: "#5E17EB" }}
            thumbColor={isOnline ? "#ffffff" : "#f4f3f4"}
          />
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="car" size={24} color="#5E17EB" />
            <Text style={styles.cardTitle}>
              {pendingRides.length} pet taxi rides found!
            </Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Ready to drive some furry friends?
          </Text>
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={handleViewRides}
          >
            <Text style={styles.viewDetailsText}>View details</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={handleViewHistory}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentTransactions.map((transaction, index) => (
            <View key={index} style={styles.transaction}>
              <Icon name="bike" size={24} color="#5E17EB" />
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>
                  {transaction.ride_count} batch deliveries
                </Text>
                <Text style={styles.transactionSubtitle}>
                  {new Date(transaction.completed_at).toLocaleDateString()},{" "}
                  {new Date(transaction.completed_at).toLocaleTimeString()} •{" "}
                  {transaction.total_distance.toFixed(1)} mi
                </Text>
              </View>
              <View style={styles.transactionAmount}>
                <Text style={styles.amountText}>
                  +${transaction.total_earnings.toFixed(2)}
                </Text>
                <Text style={styles.tipsText}>
                  +${transaction.tips.toFixed(2)} tips
                </Text>
              </View>
            </View>
          ))}
        </View>
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
  },
  header: {
    backgroundColor: "#5E17EB",
    padding: 20,
    paddingTop: 40,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  name: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  earningsLabel: {
    color: "white",
    fontSize: 14,
    marginTop: 5,
  },
  earnings: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
  logoContainer: {
    alignItems: "flex-end",
  },
  logoText: {
    color: "white",
    fontSize: 12,
    marginBottom: 5,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
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
    color: "gray",
    marginBottom: 10,
  },
  viewDetailsButton: {
    backgroundColor: "#5E17EB",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  viewDetailsText: {
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
  viewAllText: {
    color: "#5E17EB",
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
  tipsText: {
    fontSize: 12,
    color: "gray",
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

export default DriverHome;
