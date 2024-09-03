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
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Icon from "react-native-feather";
import Categories from "./Categories";
import FeaturedRow from "../../components/Ecommerce/featuredRow";
import CartIcon from "../../components/Ecommerce/cartIcon";
import { useECommerceTheme } from "../../../theme/eCommerceTheme";
import client from "../../../sanity";
import FilteredFeaturedRow from "./FilteredFeaturedRow";

const Stack = createNativeStackNavigator();

function EHomeMain() {
  const navigation = useNavigation();
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const theme = useECommerceTheme();

  useEffect(() => {
    const getFeaturedShops = async () => {
      const query = `
        *[_type == "featured"] {
          ...,
          shops[]-> {
            ...,
            type->,
            products[]->
          }
        }
      `;
      const data = await client.fetch(query);
      setFeaturedCategories(data);
    };

    const getCategories = async () => {
      const query = `*[_type == "category"]`;
      const data = await client.fetch(query);
      setCategories(data);
    };

    getFeaturedShops();
    getCategories();
  }, []);

  const filteredFeaturedCategories = featuredCategories
    .map((category) => ({
      ...category,
      shops: category.shops.filter(
        (shop) =>
          shop.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          (!selectedCategory || shop.type._id === selectedCategory)
      ),
    }))
    .filter((category) => category.shops.length > 0);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon.ArrowLeft height="24" width="24" stroke="white" />
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
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={[styles.orderListButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate("OrderList")}
        >
          <Icon.List height="20" width="20" stroke={theme.EcomOrderList} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <Text style={[styles.welcomeText, { color: theme.EcomTitle }]}>
          Find the best shops
        </Text>
        <Categories
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        {filteredFeaturedCategories.map((item, index) => (
          <FeaturedRow
            key={index}
            title={item.name || item.title}
            shops={item.shops || []}
            description={item.description || item.short_description}
          />
        ))}
      </ScrollView>
      <CartIcon />
    </SafeAreaView>
  );
}

export default function EHome() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EHomeMain" component={EHomeMain} />
      <Stack.Screen
        name="FilteredFeaturedRow"
        component={FilteredFeaturedRow}
      />
    </Stack.Navigator>
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
    backgroundColor: "#7C3AED",
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
