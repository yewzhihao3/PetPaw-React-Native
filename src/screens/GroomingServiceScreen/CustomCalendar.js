import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const CustomCalendar = ({ onSelectDate, disabledDates = [] }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const renderCalendarDays = () => {
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        i
      );
      const isDisabled = disabledDates.some(
        (disabledDate) =>
          disabledDate.getDate() === date.getDate() &&
          disabledDate.getMonth() === date.getMonth() &&
          disabledDate.getFullYear() === date.getFullYear()
      );

      days.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.dayButton,
            selectedDate?.getDate() === i && styles.selectedDay,
            isDisabled && styles.disabledDay,
          ]}
          onPress={() => {
            if (!isDisabled) {
              const newSelectedDate = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                i
              );
              setSelectedDate(newSelectedDate);
              onSelectDate(newSelectedDate);
            }
          }}
          disabled={isDisabled}
        >
          <Text
            style={[
              styles.dayText,
              selectedDate?.getDate() === i && styles.selectedDayText,
              isDisabled && styles.disabledDayText,
            ]}
          >
            {i}
          </Text>
        </TouchableOpacity>
      );
    }
    return days;
  };

  const changeMonth = (increment) => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + increment,
        1
      )
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeMonth(-1)}>
          <Text style={styles.headerButton}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentMonth.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)}>
          <Text style={styles.headerButton}>{">"}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.weekDays}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <Text key={day} style={styles.weekDayText}>
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.daysContainer}>
        {[...Array(firstDayOfMonth)].map((_, index) => (
          <View key={`empty-${index}`} style={styles.emptyDay} />
        ))}
        {renderCalendarDays()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerButton: {
    fontSize: 18,
    color: "#8A2BE2",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  weekDays: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  weekDayText: {
    color: "#888",
    fontSize: 14,
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayButton: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    fontSize: 16,
    color: "#333",
  },
  selectedDay: {
    backgroundColor: "#8A2BE2",
    borderRadius: 20,
  },
  selectedDayText: {
    color: "white",
  },
  disabledDay: {
    opacity: 0.3,
  },
  disabledDayText: {
    color: "#888",
  },
  emptyDay: {
    width: "14.28%",
    aspectRatio: 1,
  },
});

export default CustomCalendar;
