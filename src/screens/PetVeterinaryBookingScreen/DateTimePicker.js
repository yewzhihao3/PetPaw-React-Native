import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import { getBookedAppointments } from "./PVapiService";

const convertUTCToMalaysiaTime = (utcDateString) => {
  const date = new Date(utcDateString);
  return date.toLocaleString("en-US", {
    timeZone: "Asia/Kuala_Lumpur",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const DateTimePicker = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      fetchAppointments(selectedDate);
    }
  }, [selectedDate]);

  const fetchAppointments = async (date) => {
    setLoading(true);
    try {
      const appointments = await getBookedAppointments(date);
      const booked = appointments.map((app) => {
        return convertUTCToMalaysiaTime(app.date_time).split(":")[0] + ":00";
      });
      setBookedSlots(booked);
      setAvailableSlots(generateTimeSlots(date, booked));
    } catch (error) {
      console.error("Error fetching booked appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = (date, bookedSlots) => {
    const slots = [];
    for (let hour = 9; hour < 22; hour++) {
      const time = `${hour.toString().padStart(2, "0")}:00`;
      slots.push({
        id: `${date}T${time}:00.000+08:00`, // Note the +08:00 to indicate Malaysia time
        time,
        available: !bookedSlots.includes(time),
      });
    }
    return slots;
  };

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
  };

  const handleTimeSelect = (dateTime) => {
    const selectedDate = new Date(dateTime);

    console.log(
      "Selected Date and Time (Local):",
      selectedDate.toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" })
    );
    console.log(
      "Selected Date and Time (ISO Local):",
      selectedDate.toISOString()
    );

    console.log(
      "Selected Time (24-hour):",
      selectedDate.toLocaleTimeString("en-US", {
        hour12: false,
        timeZone: "Asia/Kuala_Lumpur",
      })
    );
    console.log(
      "Selected Time (12-hour):",
      selectedDate.toLocaleTimeString("en-US", {
        hour12: true,
        timeZone: "Asia/Kuala_Lumpur",
      })
    );

    // Send the local time as is
    navigation.navigate({
      name: "BookAppointment",
      params: { selectedDateTime: selectedDate.toISOString() },
      merge: true,
    });
  };

  const renderTimeSlot = ({ item }) => (
    <TouchableOpacity
      style={[styles.timeSlot, !item.available && styles.bookedSlot]}
      onPress={() => item.available && handleTimeSelect(item.id)}
      disabled={!item.available}
    >
      <Text
        style={[styles.timeSlotText, !item.available && styles.bookedSlotText]}
      >
        {item.time}
      </Text>
      {!item.available && <Text style={styles.bookedText}>Booked</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Date and Time</Text>
        <View style={styles.placeholder} />
      </View>

      <Calendar
        onDayPress={handleDateSelect}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: "#6d28d9" },
        }}
        minDate={new Date().toISOString().split("T")[0]}
        theme={{
          todayTextColor: "#6d28d9",
          arrowColor: "#6d28d9",
          selectedDayBackgroundColor: "#6d28d9",
          selectedDayTextColor: "#ffffff",
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#6d28d9" style={styles.loader} />
      ) : (
        selectedDate && (
          <FlatList
            data={availableSlots}
            renderItem={renderTimeSlot}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.timeSlotList}
          />
        )
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#6d28d9",
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  timeSlotList: {
    padding: 20,
  },
  timeSlot: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    alignItems: "center",
  },
  bookedSlot: {
    backgroundColor: "#FECACA", // Light red background
  },
  timeSlotText: {
    fontSize: 16,
    color: "#4B5563",
  },
  bookedSlotText: {
    color: "#DC2626", // Red text
  },
  bookedText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 4,
  },
  loader: {
    marginTop: 20,
  },
});

export default DateTimePicker;
