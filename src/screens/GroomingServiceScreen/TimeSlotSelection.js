import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

const TimeSlotSelection = ({
  availableSlots,
  selectedSlot,
  onSelectSlot,
  duration,
}) => {
  const renderTimeSlots = () => {
    const allSlots = generateTimeSlots();
    return allSlots.map((slot, index) => {
      const isAvailable = availableSlots.some(
        (availableSlot) => availableSlot.startTime === slot.startTime
      );
      const isSelected =
        selectedSlot && selectedSlot.startTime === slot.startTime;
      const endTime = new Date(
        new Date(`2000-01-01T${slot.startTime}`).getTime() + duration * 60000
      );
      const formattedEndTime = endTime.toTimeString().slice(0, 5);

      return (
        <TouchableOpacity
          key={index}
          style={[
            styles.timeSlot,
            isSelected && styles.selectedTimeSlot,
            !isAvailable && styles.unavailableTimeSlot,
          ]}
          onPress={() => isAvailable && onSelectSlot(slot)}
          disabled={!isAvailable}
        >
          <Text
            style={[
              styles.timeSlotText,
              isSelected && styles.selectedTimeSlotText,
              !isAvailable && styles.unavailableTimeSlotText,
            ]}
          >
            {slot.startTime} - {formattedEndTime}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 10; hour < 22; hour++) {
      const time = `${hour.toString().padStart(2, "0")}:00`;
      slots.push({ startTime: time });
    }
    return slots;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Time Slots</Text>
      <ScrollView style={styles.scrollView}>
        <View style={styles.slotsContainer}>{renderTimeSlots()}</View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  scrollView: {
    maxHeight: 300,
  },
  slotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  timeSlot: {
    width: "48%",
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#8A2BE2",
    marginBottom: 10,
    alignItems: "center",
  },
  selectedTimeSlot: {
    backgroundColor: "#8A2BE2",
  },
  unavailableTimeSlot: {
    backgroundColor: "#ffcccc",
    borderColor: "#ff8888",
  },
  timeSlotText: {
    color: "#8A2BE2",
    fontSize: 14,
  },
  selectedTimeSlotText: {
    color: "white",
  },
  unavailableTimeSlotText: {
    color: "#ff8888",
  },
});

export default TimeSlotSelection;
