import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const TimeSlotSelection = ({
  availableSlots,
  selectedSlot,
  onSelectSlot,
  duration,
}) => {
  const renderTimeSlots = () => {
    return availableSlots.map((slot, index) => {
      const isSelected =
        selectedSlot && selectedSlot.startTime === slot.startTime;
      const endTime = new Date(
        new Date(`2000-01-01T${slot.startTime}`).getTime() + duration * 60000
      );
      const formattedEndTime = endTime.toTimeString().slice(0, 5);

      return (
        <TouchableOpacity
          key={index}
          style={[styles.timeSlot, isSelected && styles.selectedTimeSlot]}
          onPress={() => onSelectSlot(slot)}
        >
          <Text
            style={[
              styles.timeSlotText,
              isSelected && styles.selectedTimeSlotText,
            ]}
          >
            {slot.startTime} - {formattedEndTime}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Time Slots</Text>
      <View style={styles.slotsContainer}>{renderTimeSlots()}</View>
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
  timeSlotText: {
    color: "#8A2BE2",
    fontSize: 14,
  },
  selectedTimeSlotText: {
    color: "white",
  },
});

export default TimeSlotSelection;
