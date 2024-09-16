import React from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import PetTipCard from "./PetTipCard";

const PetTipsList = ({ petTips, loading, navigation }) => {
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6d28d9" />
      </View>
    );
  }

  if (petTips.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>
          No tips available for this category.
        </Text>
      </View>
    );
  }

  const renderTip = ({ item }) => (
    <PetTipCard
      tip={item}
      onPress={() => navigation.navigate("PetTipDetail", { tipId: item.id })}
    />
  );

  return (
    <FlatList
      data={petTips}
      renderItem={renderTip}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});

export default PetTipsList;
