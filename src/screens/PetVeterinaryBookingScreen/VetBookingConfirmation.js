import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const VetBookingConfirmation = ({ route, navigation }) => {
  const { appointment, service, pet, totalPrice } = route.params;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#6d28d9" barStyle="light-content" />

      {/* Added Close Button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.navigate("VetHome")}
      >
        <Ionicons name="close" size={28} color="#4B5563" />
      </TouchableOpacity>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.checkmarkContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#10B981" />
        </View>

        <Text style={styles.title}>Booking Confirmed!</Text>

        <Animated.View
          style={[
            styles.cardContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Appointment Details</Text>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.detailRow}>
                <Ionicons name="paw" size={24} color="#6d28d9" />
                <Text style={styles.detailText}>
                  {pet?.name || appointment.other_pet_species}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="medical" size={24} color="#6d28d9" />
                <Text style={styles.detailText}>{service.name}</Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={24} color="#6d28d9" />
                <Text style={styles.detailText}>
                  {new Date(appointment.date_time).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="time" size={24} color="#6d28d9" />
                <Text style={styles.detailText}>
                  {new Date(appointment.date_time).toLocaleTimeString()}
                </Text>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Total Price:</Text>
                <Text style={styles.priceValue}>
                  RM {totalPrice?.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("BookingList")}
        >
          <Text style={styles.buttonText}>View My Bookings</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  // Added Close Button Styles
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  checkmarkContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 24,
    textAlign: "center",
  },
  cardContainer: {
    width: "100%",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4B5563",
  },
  cardContent: {
    padding: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  detailText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#4B5563",
    flex: 1,
  },
  priceContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10B981",
  },
  button: {
    backgroundColor: "#6d28d9",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default VetBookingConfirmation;
