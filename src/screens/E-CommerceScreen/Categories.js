import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { getCategories } from "../../../api";
import { urlFor } from "../../../sanity";
import { useECommerceTheme } from "../../../theme/eCommerceTheme";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width * 0.2; // 20% of screen width

export default function Categories() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const theme = useECommerceTheme();

  useEffect(() => {
    getCategories().then((data) => {
      setCategories(data);
    });
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {categories.map((category) => {
          let isActive = category._id == activeCategory;
          let buttonStyle = isActive
            ? [styles.categoryButton, { backgroundColor: theme.primary }]
            : [
                styles.categoryButton,
                { backgroundColor: theme.cardBackground },
              ];
          let textStyle = isActive
            ? [styles.categoryText, { color: theme.buttonText }]
            : [styles.categoryText, { color: theme.text }];

          return (
            <TouchableOpacity
              key={category._id}
              onPress={() => setActiveCategory(category._id)}
              style={styles.categoryItem}
            >
              <View style={buttonStyle}>
                <Image
                  style={styles.categoryImage}
                  source={{ uri: urlFor(category.image).url() }}
                />
              </View>
              <Text style={textStyle} numberOfLines={1}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    width: ITEM_WIDTH,
    marginHorizontal: 6,
    alignItems: "center",
  },
  categoryButton: {
    width: ITEM_WIDTH - 10,
    height: ITEM_WIDTH - 10,
    borderRadius: (ITEM_WIDTH - 10) / 2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryImage: {
    width: ITEM_WIDTH - 30,
    height: ITEM_WIDTH - 30,
    borderRadius: (ITEM_WIDTH - 30) / 2,
  },
  categoryText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
