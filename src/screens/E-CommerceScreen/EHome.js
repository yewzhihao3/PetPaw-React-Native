import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Icon from "react-native-feather";
import Categories from "./Categories";
import FeaturedRow from "../../components/Ecommerce/featuredRow";
import CartIcon from "../../components/Ecommerce/cartIcon";
import { getFeaturedShops } from "../../../api";
import { useECommerceTheme } from "../../../theme/eCommerceTheme";

export default function EHome() {
  const navigation = useNavigation();
  const [featuredShops, setFeaturedShops] = useState([]);
  const theme = useECommerceTheme();

  useEffect(() => {
    getFeaturedShops().then((data) => {
      setFeaturedShops(data);
    });
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon.ArrowLeft height="24" width="24" stroke={theme.text} />
        </TouchableOpacity>
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <Icon.Search height="20" width="20" stroke={theme.textSecondary} />
          <TextInput
            placeholder="Search stores"
            style={[styles.searchInput, { color: theme.text }]}
            placeholderTextColor={theme.textSecondary}
          />
        </View>
        <TouchableOpacity
          style={[styles.orderListButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate("OrderList")}
        >
          <Icon.List height="20" width="20" stroke={theme.buttonText} />
        </TouchableOpacity>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <Text style={[styles.welcomeText, { color: theme.text }]}>
          Find the best shops
        </Text>
        <Categories />
        {featuredShops.map((item, index) => (
          <FeaturedRow
            key={index}
            title={item.title}
            shops={item.shops || []}
            description={item.description}
          />
        ))}
      </ScrollView>
      <CartIcon />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  orderListButton: {
    padding: 12,
    borderRadius: 20,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    marginHorizontal: 16,
    marginVertical: 16,
  },
});
