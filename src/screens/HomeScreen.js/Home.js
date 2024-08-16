import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/HomeScreen/Header";
import Banner from "../../components/HomeScreen/Banner";
import ServicesGrid from "../../components/HomeScreen/ServicesGrid";
import Navbar from "../../components/HomeScreen/Navbar";
import { useECommerceTheme } from "../../../theme/eCommerceTheme";

export default function HomeScreen() {
  const theme = useECommerceTheme();

  const bannerData = [
    {
      title: "Find Nearest",
      subtitle: "Veterinarians for Your Pet",
      buttonText: "Find Now",
      imagePath: require("../../../assets/home/vetL.webp"),
      route: "ComingSoon",
    },
    {
      title: "Pet E-Commerce",
      subtitle: "Best deals on pet food and accessories",
      buttonText: "Shop Now",
      imagePath: require("../../../assets/home/e-com.webp"),
      route: "ECommerce",
    },
    {
      title: "Pet Taxi",
      subtitle: "Safe and comfortable rides for your furry friends",
      buttonText: "Book Now",
      imagePath: require("../../../assets/home/petTaxi.webp"),
      route: "ComingSoon",
    },
  ];

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
        edges={["top"]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Header />
          <Banner banners={bannerData} />
          <ServicesGrid />
        </ScrollView>
        <Navbar activeScreen="Home" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 90,
  },
});
