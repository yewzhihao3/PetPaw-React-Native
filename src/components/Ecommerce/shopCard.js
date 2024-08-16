import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import * as Icon from "react-native-feather";
import { useNavigation } from "@react-navigation/native";
import { urlFor } from "../../../sanity";
import { useECommerceTheme } from "../../../theme/eCommerceTheme";

export default function ShopCard({ item }) {
  const navigation = useNavigation();
  const theme = useECommerceTheme();

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        onPress={() => navigation.navigate("EStore", { ...item })}
        style={[
          styles.container,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.primary,
          },
        ]}
      >
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image
              style={styles.image}
              source={{ uri: urlFor(item.image).url() }}
            />
          ) : (
            <View
              style={[styles.noImage, { backgroundColor: theme.placeholder }]}
            >
              <Text style={{ color: theme.textSecondary }}>No Image</Text>
            </View>
          )}
        </View>
        <View style={styles.infoContainer}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.ratingContainer}>
            <Icon.Star fill="#FFD700" color="#FFD700" width={16} height={16} />
            <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
              <Text style={{ color: theme.primary }}>{item.stars}</Text> (
              {item.reviews} reviews) •
              <Text style={{ color: theme.primary, fontWeight: "bold" }}>
                {" "}
                {item?.type?.name}
              </Text>
            </Text>
          </View>
          <View style={styles.addressContainer}>
            <Icon.MapPin color={theme.primary} width="15" height="15" />
            <Text
              style={[styles.address, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              Nearby • {item.address.fullAddress}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <View
        style={[
          styles.rightShadow,
          { backgroundColor: "rgba(109, 40, 217, 0.2)" },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: 300,
    marginRight: 24,
    marginBottom: 16,
    position: "relative",
  },
  container: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderBottomWidth: 3,
    elevation: 2,
  },
  rightShadow: {
    position: "absolute",
    top: 5,
    bottom: 5,
    right: -5,
    width: 10,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    zIndex: -1,
  },
  imageContainer: {
    position: "relative",
    height: 160,
    width: "100%",
  },
  image: {
    height: "100%",
    width: "100%",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  noImage: {
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  infoContainer: {
    padding: 16,
  },
  name: {
    fontSize: 18,
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
  },
  address: {
    fontSize: 14,
    marginLeft: 4,
  },
});
