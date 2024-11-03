import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 32; // Full width minus padding
const SPACING = 16;

const ServiceCarousel = ({ services }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const newIndex = Math.round(
          event.nativeEvent.contentOffset.x / (CARD_WIDTH + SPACING)
        );
        if (newIndex !== currentIndex) {
          setCurrentIndex(newIndex);
        }
      },
    }
  );

  const renderService = (service, index) => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + SPACING),
      index * (CARD_WIDTH + SPACING),
      (index + 1) * (CARD_WIDTH + SPACING),
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.95, 1, 0.95],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        key={service.id}
        style={[
          styles.serviceCard,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={service.icon} size={32} color="#8A2BE2" />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceDescription} numberOfLines={2}>
            {service.description ||
              "Experience our professional grooming service for your beloved pet"}
          </Text>

          <View style={styles.detailsContainer}>
            <View style={styles.detail}>
              <Ionicons name="time-outline" size={16} color="#8A2BE2" />
              <Text style={styles.detailText}>{service.duration} min</Text>
            </View>

            <View style={styles.priceTag}>
              <Text style={styles.priceText}>
                RM {service.price.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardDecoration} />
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        snapToInterval={CARD_WIDTH + SPACING}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {services.map((service, index) => renderService(service, index))}
      </Animated.ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {services.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              currentIndex === index && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 220,
    marginVertical: 20,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
  },
  serviceCard: {
    width: CARD_WIDTH,
    height: 180,
    marginRight: SPACING,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#8A2BE2",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    position: "relative",
    overflow: "hidden",
  },
  iconContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: "#F8F4FF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  serviceName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
    maxWidth: "80%",
  },
  serviceDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    maxWidth: "80%",
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  detail: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F4FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  detailText: {
    marginLeft: 4,
    color: "#8A2BE2",
    fontSize: 14,
    fontWeight: "500",
  },
  priceTag: {
    backgroundColor: "#8A2BE2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cardDecoration: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F8F4FF",
    opacity: 0.5,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D8D8D8",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#8A2BE2",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default ServiceCarousel;
