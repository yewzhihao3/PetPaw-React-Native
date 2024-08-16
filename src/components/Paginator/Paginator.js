import { View, StyleSheet, Animated, useWindowDimensions } from "react-native";
import React from "react";

export default Paginator = ({ data, scrollX }) => {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, { flexDirection: "row", height: 64 }]}>
      {data.map((_, i) => {
        const inputRange = [
          (i - 1) * width, // Previous dot
          i * width, // Current dot
          (i + 1) * width, // Next dot
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [10, 20, 10],
          extrapolate: "clamp",
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            style={[styles.dot, { width: dotWidth, opacity }]}
            key={i.toString()}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#6d28d9",
    marginHorizontal: 8,
  },
});
