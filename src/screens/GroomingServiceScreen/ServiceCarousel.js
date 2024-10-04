import React, { useRef } from "react";
import { ScrollView, View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ServiceCarousel = ({ services }) => {
  const scrollX = useRef(new Animated.Value(0)).current;

  const renderService = (service, index) => {
    const inputRange = [(index - 1) * 200, index * 200, (index + 1) * 200];
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        key={service.id}
        style={[styles.serviceCard, { transform: [{ scale }] }]}
      >
        <Ionicons name={service.icon} size={40} color="#8A2BE2" />
        <Text style={styles.serviceName}>{service.name}</Text>
        <Text style={styles.servicePrice}>{service.price}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        snapToInterval={200}
        decelerationRate="fast"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
      >
        {services.map(renderService)}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
  },
  scrollViewContent: {
    alignItems: "center",
    paddingHorizontal: 10,
  },
  serviceCard: {
    width: 160,
    height: 180,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    textAlign: "center",
  },
  servicePrice: {
    fontSize: 14,
    color: "#8A2BE2",
    marginTop: 5,
  },
});

export default ServiceCarousel;
