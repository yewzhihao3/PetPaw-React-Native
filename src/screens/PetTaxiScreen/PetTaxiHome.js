import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserPetTaxiRides } from "../../screens/API/apiService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Animated } from "react-native";

const PetTaxiHome = () => {
  const [recentRides, setRecentRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showAllRides, setShowAllRides] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchRecentRides();
  }, []);

  const fetchRecentRides = async () => {
    try {
      const rides = await getUserPetTaxiRides();
      setRecentRides(rides);
    } catch (error) {
      console.error("Error fetching recent rides:", error);
    }
  };

  const renderRideItem = ({ item }) => (
    <TouchableOpacity
      style={styles.rideItem}
      onPress={() => {
        setSelectedRide(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.rideItemContent}>
        <Text
          style={styles.rideDestination}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          To: {item.dropoff_location}
        </Text>
        <Text style={styles.rideDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) },
        ]}
      >
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    if (!status) return "#6D28D9";
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "#10B981";
      case "IN_PROGRESS":
        return "#3B82F6";
      case "CANCELLED":
        return "#EF4444";
      default:
        return "#6D28D9";
    }
  };

  const RideDetailsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Ride Details</Text>
          <ScrollView>
            <Text style={styles.modalText}>
              From: {selectedRide?.pickup_location}
            </Text>
            <Text style={styles.modalText}>
              To: {selectedRide?.dropoff_location}
            </Text>
            <Text style={styles.modalText}>
              Date: {new Date(selectedRide?.created_at).toLocaleString()}
            </Text>
            <Text style={styles.modalText}>
              Pet Type: {selectedRide?.pet_type}
            </Text>
            <Text style={styles.modalText}>
              Fare: RM{selectedRide?.fare.toFixed(2)}
            </Text>
            <Text
              style={[
                styles.modalText,
                { color: getStatusColor(selectedRide?.status) },
              ]}
            >
              Status: {selectedRide?.status || "N/A"}
            </Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate("PetTaxiMapView", {
                  rideId: selectedRide.id,
                });
              }}
            >
              <Text style={styles.actionButtonText}>View on Map</Text>
            </TouchableOpacity>
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const PetTaxiTips = () => (
    <View style={styles.tipsContainer}>
      <Text style={styles.tipsTitle}>Pet Taxi Tips</Text>
      <View style={styles.tipsGrid}>
        {[
          { icon: "paw", text: "Bring your pet's favorite toy for comfort" },
          { icon: "water", text: "Pack water for longer rides" },
          { icon: "document-text", text: "Keep vaccination records handy" },
          { icon: "time", text: "Be ready 5 minutes before pickup" },
          { icon: "car", text: "Use a pet carrier or seat belt for safety" },
          { icon: "medkit", text: "Pack any necessary medications" },
          { icon: "call", text: "Keep your vet's contact info accessible" },
          { icon: "happy", text: "Reward good behavior during the ride" },
        ].map((tip, index) => (
          <View style={styles.tipCard} key={index}>
            <Ionicons name={tip.icon} size={32} color="#6D28D9" />
            <Text style={styles.tipText}>{tip.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const [rotateAnim] = useState(new Animated.Value(0));

  const handleRefresh = () => {
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      rotateAnim.setValue(0);
    });
    fetchRecentRides();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#6D28D9", "#6D28D9"]} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Pet Taxi</Text>
          <TouchableOpacity style={styles.headerRight} onPress={handleRefresh}>
            <Animated.Image
              source={require("../../../assets/PetTaxi/pet-taxi-icon.png")}
              style={[
                styles.headerIcon,
                {
                  transform: [
                    {
                      rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                },
              ]}
            />
          </TouchableOpacity>
        </View>
        <FlatList
          style={styles.contentContainer}
          contentContainerStyle={styles.scrollContent}
          ListHeaderComponent={
            <View style={styles.recentRidesHeader}>
              <Text style={styles.subtitle}>Recent Rides</Text>
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => setShowAllRides(!showAllRides)}
              >
                <Text style={styles.showMoreButtonText}>
                  {showAllRides ? "Show Less" : "Show More"}
                </Text>
              </TouchableOpacity>
            </View>
          }
          data={showAllRides ? recentRides : recentRides.slice(0, 3)}
          renderItem={renderRideItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No recent rides</Text>
          }
          ListFooterComponent={<PetTaxiTips />}
        />
        <TouchableOpacity
          style={styles.placeOrderButton}
          onPress={() => navigation.navigate("PetTaxiPlaceOrder")}
        >
          <Text style={styles.buttonText}>Book a Ride</Text>
        </TouchableOpacity>

        <RideDetailsModal />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F3F4F6",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerRight: {
    width: 40,
  },
  headerIcon: {
    width: 40,
    height: 40,
  },
  recentRidesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6D28D9",
  },
  showMoreButton: {
    padding: 5,
  },
  showMoreButtonText: {
    color: "#6D28D9",
    fontSize: 14,
    fontWeight: "bold",
  },
  rideItem: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rideItemContent: {
    flex: 1,
    marginRight: 10,
  },
  rideDestination: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 4,
  },
  rideDate: {
    fontSize: 14,
    color: "#6B7280",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  tipsContainer: {
    marginTop: 20,
    paddingBottom: 100,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6D28D9",
    marginBottom: 10,
  },
  tipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tipCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
    alignItems: "center",
    elevation: 2,
  },
  tipText: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 10,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#6D28D9",
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 10,
    textAlign: "center",
  },
  actionButton: {
    backgroundColor: "#6D28D9",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
    alignSelf: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  closeButton: {
    marginTop: 20,
  },
  closeButtonText: {
    color: "#6D28D9",
    fontSize: 16,
    fontWeight: "bold",
  },
  placeOrderButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#6D28D9",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 16,
    marginTop: 20,
  },
});

export default PetTaxiHome;
