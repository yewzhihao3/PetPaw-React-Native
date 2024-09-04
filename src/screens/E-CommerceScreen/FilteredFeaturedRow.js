import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useECommerceTheme } from "../../../theme/eCommerceTheme";
import * as Icon from "react-native-feather";
import { urlFor } from "../../../sanity";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = width - 32; // Full width with padding

const ShopCard = ({ item, navigation }) => {
  const theme = useECommerceTheme();

  const handlePress = () => {
    navigation.navigate("EStore", { ...item });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View
        style={[
          styles.shopCard,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.cardBorder,
          },
        ]}
      >
        <Image
          source={{ uri: urlFor(item.image).url() }}
          style={styles.shopImage}
        />
        <View style={styles.shopInfo}>
          <Text style={[styles.shopName, { color: theme.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.shopType, { color: theme.primary }]}>
            {item.type?.name}
          </Text>
          <View style={styles.ratingContainer}>
            <Icon.Star fill="#FFD700" color="#FFD700" width={16} height={16} />
            <Text style={[styles.rating, { color: theme.textSecondary }]}>
              {item.rating} ({item.reviews} reviews)
            </Text>
          </View>
          <View style={styles.locationContainer}>
            <Icon.MapPin width={14} height={14} stroke={theme.textSecondary} />
            <Text style={[styles.location, { color: theme.textSecondary }]}>
              Nearby • {item.address?.fullAddress}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function FilteredFeaturedRow() {
  const navigation = useNavigation();
  const route = useRoute();
  const { title, shops, description } = route.params;
  const theme = useECommerceTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon.ArrowLeft height="24" width="24" stroke="#FFFFFF" />
        </TouchableOpacity>
        <Text style={[styles.title, { color: "#FFFFFF" }]}>{title}</Text>
      </View>
      <View
        style={[
          styles.descriptionContainer,
          { backgroundColor: theme.cardBackground },
        ]}
      >
        <Icon.Info
          width={20}
          height={20}
          stroke={theme.primary}
          style={styles.descriptionIcon}
        />
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {description}
        </Text>
      </View>
      <FlatList
        data={shops}
        renderItem={({ item }) => (
          <ShopCard item={item} navigation={navigation} />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.shopList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  shopList: {
    padding: 16,
  },
  shopCard: {
    width: COLUMN_WIDTH,
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    flexDirection: "row",
  },
  shopImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    margin: 12,
  },
  shopInfo: {
    flex: 1,
    padding: 12,
  },
  shopName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  shopType: {
    fontSize: 14,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    marginLeft: 4,
    fontSize: 14,
  },
  descriptionContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  descriptionIcon: {
    marginRight: 12,
  },
  description: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
});
