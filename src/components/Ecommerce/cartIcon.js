import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectCartItems, selectCartTotal } from "../../slices/cartSlice";
import { useECommerceTheme } from "../../../theme/eCommerceTheme";

const { width } = Dimensions.get("window");

export default function CartIcon() {
  const navigation = useNavigation();
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const theme = useECommerceTheme();

  const totalItemsCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  console.log(
    "CartIcon rendered. Total items:",
    totalItemsCount,
    "Cart items:",
    cartItems
  );

  if (totalItemsCount === 0) {
    console.log("Cart is empty, not rendering CartIcon");
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Cart")}
        style={[styles.button, { backgroundColor: theme.primary }]}
      >
        <View style={styles.itemCountContainer}>
          <Text style={styles.itemCountText}>{totalItemsCount}</Text>
        </View>
        <Text style={styles.viewCartText}>View Cart</Text>
        <Text style={styles.totalText}>RM{cartTotal.toFixed(2)}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 50,
  },
  button: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 30,
    width: width * 0.9, // 90% of screen width
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  itemCountContainer: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  itemCountText: {
    fontWeight: "bold",
    color: "white",
    fontSize: 18,
  },
  viewCartText: {
    flex: 1,
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  totalText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
