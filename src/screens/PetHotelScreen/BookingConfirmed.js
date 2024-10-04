import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const BookingConfirmed = ({ route, navigation }) => {
  const {
    hotel,
    startDate,
    endDate,
    pet,
    petSize,
    specialRequests,
    dietaryNeeds,
    medicationNeeds,
    emergencyContact,
  } = route.params;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const renderSection = (title, content, icon, delay) => (
    <Animated.View
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 50 + delay * 20],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {content}
    </Animated.View>
  );

  const handleDone = () => {
    navigation.navigate("PetHotelBooking");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleDone} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Booking Confirmed</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View
          style={[
            styles.confirmationBanner,
            {
              opacity: fadeAnim,
              transform: [{ scale: fadeAnim }],
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={50} color="#6B46C1" />
          <Text style={styles.confirmationText}>
            Your booking is confirmed!
          </Text>
        </Animated.View>

        {renderSection(
          "Hotel Details",
          <View>
            <Text style={styles.infoText}>{hotel.name}</Text>
            <Text style={styles.infoText}>{hotel.type} Package</Text>
          </View>,
          <Ionicons name="business" size={24} color="#6B46C1" />,
          0
        )}

        {renderSection(
          "Booking Dates",
          <View>
            <Text style={styles.infoText}>Check-in: {startDate}</Text>
            <Text style={styles.infoText}>Check-out: {endDate}</Text>
          </View>,
          <Ionicons name="calendar" size={24} color="#6B46C1" />,
          1
        )}

        {renderSection(
          "Pet Information",
          <View>
            <Text style={styles.infoText}>Name: {pet.name}</Text>
            <Text style={styles.infoText}>Type: {pet.species}</Text>
            <Text style={styles.infoText}>Size: {petSize}</Text>
          </View>,
          <MaterialCommunityIcons name="paw" size={24} color="#6B46C1" />,
          2
        )}

        {renderSection(
          "Special Requirements",
          <View>
            <Text style={styles.infoText}>
              Dietary Needs: {dietaryNeeds || "None"}
            </Text>
            <Text style={styles.infoText}>
              Medication Needs: {medicationNeeds || "None"}
            </Text>
            <Text style={styles.infoText}>
              Special Requests: {specialRequests || "None"}
            </Text>
          </View>,
          <Ionicons name="list" size={24} color="#6B46C1" />,
          3
        )}

        {renderSection(
          "Emergency Contact",
          <Text style={styles.infoText}>{emergencyContact}</Text>,
          <Ionicons name="call" size={24} color="#6B46C1" />,
          4
        )}

        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6B46C1",
    padding: 15,
  },
  backButton: {
    padding: 10,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  content: {
    padding: 20,
  },
  confirmationBanner: {
    alignItems: "center",
    marginBottom: 20,
  },
  confirmationText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6B46C1",
    marginTop: 10,
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#F3E8FF",
    borderRadius: 10,
    padding: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A5568",
    marginLeft: 10,
  },
  infoText: {
    fontSize: 16,
    color: "#4A5568",
    marginBottom: 5,
  },
  doneButton: {
    backgroundColor: "#6B46C1",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default BookingConfirmed;
