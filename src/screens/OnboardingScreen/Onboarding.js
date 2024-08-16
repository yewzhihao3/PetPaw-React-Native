import { View, Text, StyleSheet, FlatList, Animated } from "react-native";
import React, { useState, useRef } from "react";
import Onboardingitem from "../OnboardingScreen/Onboardingitem";
import slides from "./slides";
import Paginator from "../../components/Paginator/Paginator";
import NextButton from "../../components/CustomButton/NextButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default Onboarding = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const ViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = async () => {
    if (currentIndex < slides.length - 1) {
      // Not the last slide, move to the next slide
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // Last slide, perform any final actions and navigate to the login page
      try {
        await AsyncStorage.setItem("@viewedOnboarding", "true");
        // Navigate to the Login screen after setting the item
        navigation.navigate("Login"); // Use navigate instead of push if you're using react-navigation v5 or later
      } catch (err) {
        console.log("error @setItem ", err);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 3 }}>
        <FlatList
          data={slides}
          renderItem={({ item }) => <Onboardingitem item={item} />}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            {
              useNativeDriver: false,
            }
          )}
          scrollEventThrottle={32}
          onViewableItemsChanged={ViewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
        <Paginator data={slides} scrollX={scrollX}></Paginator>
      </View>
      <NextButton
        scrollTo={scrollTo}
        percentage={(currentIndex + 1) * (100 / slides.length)}
        onPress={() => navigation.push("Login")}
      ></NextButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "",
  },
});
