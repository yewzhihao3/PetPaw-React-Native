import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ServiceCard from "./ServiceCard";
import { useTheme } from "../../../theme/Themecontext";

const ServicesGrid = () => {
  const { theme } = useTheme();

  const services = [
    {
      title: "Veterinary",
      image: require("../../../assets/home/1.png"),
      route: "ComingSoon",
    },
    {
      title: "Grooming",
      image: require("../../../assets/home/2.png"),
      route: "ComingSoon",
    },
    {
      title: "Pet Tips",
      image: require("../../../assets/home/3.png"),
      route: "ComingSoon",
    },
    {
      title: "E-Commerce",
      image: require("../../../assets/home/4.png"),
      route: "ECommerce",
    },
    {
      title: "Pet Taxi",
      image: require("../../../assets/home/5.png"),
      route: "ComingSoon",
    },
    {
      title: "Pet Hotel",
      image: require("../../../assets/home/6.png"),
      route: "ComingSoon",
    },
    {
      title: "Pet Tamagotchi Game",
      image: require("../../../assets/home/7.png"),
      route: "Tamagotchi",
    },
    {
      title: "Pet Diary",
      image: require("../../../assets/home/8.png"),
      route: "ComingSoon",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.title }]}>
        Services
      </Text>
      <View style={styles.gridContainer}>
        {services.map((service, index) => (
          <ServiceCard
            key={index}
            title={service.title}
            imageSource={service.image}
            route={service.route}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});

export default ServicesGrid;
