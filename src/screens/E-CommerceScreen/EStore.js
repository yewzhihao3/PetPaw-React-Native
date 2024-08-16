import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Icon from "react-native-feather";
import ProductRow from "../../components/Ecommerce/productRow";
import CartIcon from "../../components/Ecommerce/cartIcon";
import { StatusBar } from "expo-status-bar";
import { useDispatch } from "react-redux";
import { setShop } from "../../slices/eShopslice";
import { urlFor } from "../../../sanity";
import { useECommerceTheme } from "../../../theme/eCommerceTheme";

const { height } = Dimensions.get("window");

export default function EStore() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const theme = useECommerceTheme();
  let item = params;

  useEffect(() => {
    if (item && item._id) {
      dispatch(setShop(item));
    }
  }, [item, dispatch]);

  if (!item) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <Text style={{ color: theme.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.dark ? "light" : "dark"} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={{ uri: urlFor(item.image).url() }}
          />
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[
              styles.backButton,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <Icon.ArrowLeft strokeWidth={3} stroke={theme.text} />
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.infoContainer,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Icon.Star fill="#FFD700" color="#FFD700" width={20} height={20} />
            <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
              <Text style={{ color: theme.primary }}>{item.stars}</Text> (
              {item.reviews} reviews) •
              <Text style={{ color: theme.primary }}> {item?.type?.name}</Text>
            </Text>
          </View>
          <View style={styles.addressContainer}>
            <Icon.MapPin color={theme.primary} width="16" height="16" />
            <Text style={[styles.address, { color: theme.textSecondary }]}>
              Nearby • {item.address.fullAddress}
            </Text>
          </View>
          <Text style={[styles.description, { color: theme.text }]}>
            {item.description}
          </Text>
        </View>
        <View style={styles.productsContainer}>
          <Text style={[styles.productsTitle, { color: theme.text }]}>
            Menu
          </Text>
          {item.products.map((product, index) => (
            <ProductRow item={product} key={index} />
          ))}
        </View>
      </ScrollView>
      <CartIcon />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 120, // Increased bottom padding to accommodate the CartIcon
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: height * 0.25, // 25% of screen height
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 16,
    padding: 8,
    borderRadius: 20,
  },
  infoContainer: {
    padding: 16,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  address: {
    fontSize: 14,
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  productsContainer: {
    marginTop: 16,
  },
  productsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
});
