import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import { useECommerceTheme } from "../../../theme/eCommerceTheme";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const BANNER_WIDTH = width - 64; // Adjust this value as needed

const BannerItem = ({
  title,
  subtitle,
  buttonText,
  imagePath,
  accentColor,
  onPress,
  theme,
  route,
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (route === "ComingSoon") {
      Alert.alert("Coming Soon", `The ${title} feature is coming soon!`);
    } else if (route) {
      navigation.navigate(route);
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <View
      style={[
        styles.bannerContainer,
        {
          backgroundColor: theme.cardBackground,
          borderColor: accentColor,
        },
      ]}
    >
      <View style={styles.bannerContent}>
        <View style={styles.textContainer}>
          <Text style={[styles.bannerTitle, { color: theme.text }]}>
            {title}
          </Text>
          <Text style={[styles.bannerSubtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: accentColor }]}
            onPress={handlePress}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.imageContainer}>
          <Image source={imagePath} style={styles.bannerImage} />
        </View>
      </View>
      <View style={[styles.accentCorner, { borderColor: accentColor }]} />
    </View>
  );
};

const Banner = ({ banners }) => {
  const theme = useECommerceTheme();
  const accentColor = "#6d28d9";
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const scrollInterval = setInterval(() => {
      if (currentIndex < banners.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
    }, 5000); // 5 seconds

    return () => clearInterval(scrollInterval);
  }, [currentIndex, banners.length]);

  useEffect(() => {
    scrollViewRef.current?.scrollTo({
      x: currentIndex * BANNER_WIDTH,
      animated: true,
    });
  }, [currentIndex]);

  return (
    <View>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(
            event.nativeEvent.contentOffset.x / BANNER_WIDTH
          );
          setCurrentIndex(newIndex);
        }}
      >
        {banners.map((banner, index) => (
          <BannerItem
            key={index}
            {...banner}
            theme={theme}
            accentColor={accentColor}
          />
        ))}
      </ScrollView>
      <View style={styles.pagination}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingHorizontal: 16,
  },
  bannerContainer: {
    width: BANNER_WIDTH,
    marginRight: 16,
    borderWidth: 2,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bannerContent: {
    flexDirection: "row",
    height: 180,
  },
  textContainer: {
    flex: 0.6,
    padding: 16,
    justifyContent: "center",
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  imageContainer: {
    flex: 0.4,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  accentCorner: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderTopRightRadius: 16,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#6d28d9",
  },
});

export default Banner;
