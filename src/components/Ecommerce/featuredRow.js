import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useECommerceTheme } from "../../../theme/eCommerceTheme";
import ShopCard from "./shopCard";

export default function FeaturedRow({ title, shops, description }) {
  const theme = useECommerceTheme();
  const navigation = useNavigation();

  const handleSeeAll = () => {
    navigation.navigate("FilteredFeaturedRow", { title, shops, description });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.FRow }]}>{title}</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {description}
          </Text>
        </View>
        <TouchableOpacity onPress={handleSeeAll}>
          <Text style={[styles.seeAll, { color: theme.primary }]}>See all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {shops.slice(0, 4).map((shopItem, index) => (
          <ShopCard item={shopItem} key={index} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    marginTop: 4,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
  },
  scrollViewContent: {
    paddingHorizontal: 16,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
