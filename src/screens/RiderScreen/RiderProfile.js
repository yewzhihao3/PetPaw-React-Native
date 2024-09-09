import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  getRiderData,
  getStoredRiderData,
  fetchOrderHistory,
} from "./RiderapiService";

const RiderProfile = () => {
  const navigation = useNavigation();
  const [riderData, setRiderData] = useState(null);
  const [totalDeliveries, setTotalDeliveries] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { token, riderId } = await getStoredRiderData();
        if (token && riderId) {
          const data = await getRiderData(riderId, token);
          setRiderData(data);

          const orderHistory = await fetchOrderHistory(token, riderId);
          const completedDeliveries = orderHistory.filter(
            (order) => order.status === "DELIVERED"
          ).length;
          setTotalDeliveries(completedDeliveries);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("userRole");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {riderData?.image_url ? (
          <Image
            source={{ uri: riderData.image_url }}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Icon name="account" size={80} color="#5E17EB" />
          </View>
        )}
        <Text style={styles.name}>{riderData?.name || "Rider Name"}</Text>
        <Text style={styles.email}>
          {riderData?.email || "rider@example.com"}
        </Text>
      </View>

      <View style={styles.infoSection}>
        <InfoItem
          icon="phone"
          label="Phone"
          value={riderData?.phone_number || "N/A"}
        />
        <InfoItem
          icon="motorbike"
          label="Vehicle Type"
          value={riderData?.vehicle_type || "N/A"}
        />
        <InfoItem
          icon="card-text"
          label="Number Plate"
          value={riderData?.number_plate || "N/A"}
        />
        <InfoItem
          icon="calendar"
          label="Joined"
          value={
            riderData?.created_at
              ? new Date(riderData.created_at).toLocaleDateString()
              : "N/A"
          }
        />
      </View>

      <View style={styles.statsSection}>
        <StatItem label="Total Deliveries" value={totalDeliveries.toString()} />
        <StatItem
          label="Active Status"
          value={riderData?.is_active ? "Active" : "Inactive"}
        />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <View style={styles.infoItem}>
    <View style={styles.infoIconContainer}>
      <Icon name={icon} size={24} color="#5E17EB" />
    </View>
    <View style={styles.infoTextContainer}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const StatItem = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#5E17EB",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#ffffff",
    opacity: 0.8,
  },
  infoSection: {
    backgroundColor: "#ffffff",
    margin: 15,
    borderRadius: 10,
    padding: 15,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  infoIconContainer: {
    width: 40,
    alignItems: "center",
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#ffffff",
    margin: 15,
    borderRadius: 10,
    padding: 15,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5E17EB",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  logoutButton: {
    backgroundColor: "#ff6347",
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RiderProfile;
