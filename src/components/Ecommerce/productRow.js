import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import * as Icon from "react-native-feather";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  removeFromCart,
  selectCartItemsById,
} from "../../slices/cartSlice";
import { urlFor } from "../../../sanity";
import { useECommerceTheme } from "../../../theme/eCommerceTheme";

export default function ProductRow({ item }) {
  const dispatch = useDispatch();
  const theme = useECommerceTheme();
  const cartItem = useSelector((state) => selectCartItemsById(item._id)(state));

  const handleIncrease = () => {
    dispatch(addToCart({ ...item }));
  };

  const handleDecrease = () => {
    dispatch(removeFromCart({ _id: item._id }));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
      <Image style={styles.image} source={{ uri: urlFor(item.image).url() }} />
      <View style={styles.infoContainer}>
        <View>
          <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {item.description}
          </Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: theme.primary }]}>
            RM{item.price}
          </Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPress={handleDecrease}
              disabled={!cartItem}
              style={[
                styles.quantityButton,
                { backgroundColor: theme.primary },
              ]}
            >
              <Icon.Minus
                strokeWidth={2}
                height={20}
                width={20}
                stroke={theme.buttonText}
              />
            </TouchableOpacity>
            <Text style={[styles.quantity, { color: theme.text }]}>
              {cartItem ? cartItem.quantity : 0}
            </Text>
            <TouchableOpacity
              onPress={handleIncrease}
              style={[
                styles.quantityButton,
                { backgroundColor: theme.primary },
              ]}
            >
              <Icon.Plus
                strokeWidth={2}
                height={20}
                width={20}
                stroke={theme.buttonText}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    height: 100,
    width: 100,
    borderRadius: 12,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    padding: 8,
    borderRadius: 20,
  },
  quantity: {
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: "bold",
  },
});
