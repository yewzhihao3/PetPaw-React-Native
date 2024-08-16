import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useDriverStatus } from "./DriverStatusContext";
import DriverLocationUpdateNotification from "./DriverLocationUpdateNotification";
import { DriverNotificationManager } from "./DriverNotificationManager";

const DriverHome = () => {
  const navigation = useNavigation();
  const { isOnline, setIsOnline } = useDriverStatus();
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    // Fetch driver's earnings here when backend is implemented
  }, []);

  const handleStatusChange = async (value) => {
    setIsOnline(value);
    // Update driver's status in the backend when implemented
    await DriverNotificationManager.updateNotificationStatus(value);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Driver Dashboard</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {isOnline ? "Online" : "Offline"}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={handleStatusChange}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isOnline ? "#f5dd4b" : "#f4f3f4"}
          />
        </View>
      </View>

      <DriverLocationUpdateNotification />

      <View style={styles.earningsContainer}>
        <Text style={styles.earningsTitle}>Today's Earnings</Text>
        <Text style={styles.earningsAmount}>${earnings.toFixed(2)}</Text>
      </View>

      <TouchableOpacity
        style={styles.ordersButton}
        onPress={() => navigation.navigate("DriverOrders")}
      >
        <Icon name="clipboard-list" size={24} color="#fff" />
        <Text style={styles.buttonText}>View Orders</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate("DriverHistory")}
      >
        <Icon name="history" size={24} color="#fff" />
        <Text style={styles.buttonText}>View History</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#5E17EB",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    marginRight: 10,
    color: "#fff",
  },
  earningsContainer: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  earningsTitle: {
    fontSize: 18,
    color: "#333",
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#5E17EB",
    marginTop: 10,
  },
  ordersButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5E17EB",
    padding: 15,
    borderRadius: 10,
    margin: 20,
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 10,
    margin: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 10,
  },
});

export default DriverHome;
