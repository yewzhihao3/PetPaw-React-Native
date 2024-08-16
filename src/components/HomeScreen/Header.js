import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/Themecontext";

const Header = () => {
  const { theme } = useTheme();

  return (
    <View style={styles.header}>
      <Text style={[styles.headerTitle, { color: theme.title }]}>Petcare</Text>
      <TouchableOpacity>
        <Ionicons name="notifications-outline" size={24} color={theme.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default Header;
