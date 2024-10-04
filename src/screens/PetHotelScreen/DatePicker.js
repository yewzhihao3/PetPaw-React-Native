import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const DatePicker = ({ onSelectDate, startDate, endDate }) => {
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

  const handleDateSelect = (day) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    onSelectDate(date);
  };

  const isDateInRange = (date) => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const renderCalendar = () => {
    const calendar = [];
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Render days of the week
    calendar.push(
      <View key="days" style={styles.daysRow}>
        {daysOfWeek.map((day) => (
          <Text key={day} style={styles.dayOfWeek}>
            {day}
          </Text>
        ))}
      </View>
    );

    // Render calendar days
    let week = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      week.push(<View key={`empty-${i}`} style={styles.emptyDay} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const isStart =
        startDate && date.toDateString() === startDate.toDateString();
      const isEnd = endDate && date.toDateString() === endDate.toDateString();
      const isInRange = isDateInRange(date);

      week.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.day,
            isStart && styles.startDay,
            isEnd && styles.endDay,
            isInRange && styles.inRangeDay,
          ]}
          onPress={() => handleDateSelect(day)}
        >
          <Text
            style={[
              styles.dayText,
              (isStart || isEnd) && styles.selectedDayText,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );

      if (week.length === 7) {
        calendar.push(
          <View key={day} style={styles.week}>
            {week}
          </View>
        );
        week = [];
      }
    }

    if (week.length > 0) {
      calendar.push(
        <View key="last-week" style={styles.week}>
          {week}
        </View>
      );
    }

    return calendar;
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
      {renderCalendar()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerButton: {
    fontSize: 24,
    color: "#6B46C1",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A5568",
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  dayOfWeek: {
    width: 40,
    textAlign: "center",
    color: "#718096",
  },
  week: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 5,
  },
  day: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    color: "#4A5568",
  },
  selectedDay: {
    backgroundColor: "#6B46C1",
    borderRadius: 20,
  },
  selectedDayText: {
    color: "#FFFFFF",
  },
  emptyDay: {
    width: 40,
    height: 40,
  },
  startDay: {
    backgroundColor: "#6B46C1",
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  endDay: {
    backgroundColor: "#6B46C1",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  inRangeDay: {
    backgroundColor: "#D6BCFA",
  },
});

export default DatePicker;
