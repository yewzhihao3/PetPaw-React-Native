import React, { useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "../../../theme/Themecontext";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width / 4;

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const NavbarItem = ({ iconName, isActive, onPress, itemIndex, color }) => {
  const animatedValue = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: isActive ? 1 : 0,
      useNativeDriver: true,
      friction: 5,
      tension: 40,
    }).start();
  }, [isActive]);

  const animatedStyle = {
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10],
        }),
      },
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.2],
        }),
      },
    ],
  };

  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={isActive ? iconName : `${iconName}-outline`}
          size={isActive ? 32 : 28}
          color={color}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const Navbar = ({ currentRoute }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { isDarkMode } = useTheme();

  const screens = [
    { name: "Home", icon: "home" },
    { name: "ECommerce", icon: "cart" },
    { name: "Tamagotchi", icon: "game-controller" },
    { name: "UserProfile", icon: "person" },
  ];

  const activeScreenIndex = screens.findIndex(
    (screen) => screen.name === currentRoute
  );

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: activeScreenIndex,
      useNativeDriver: true,
      friction: 5,
      tension: 40,
    }).start();
  }, [activeScreenIndex]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, screens.length - 1],
    outputRange: [0, ITEM_WIDTH * (screens.length - 1)],
  });

  const bgColor = isDarkMode ? "#1E1E1E" : "white";
  const fgColor = isDarkMode ? "white" : "black";
  const activeColor = "#6d28d9";

  return (
    <View
      style={[
        styles.navContainer,
        { height: 70 + insets.bottom, backgroundColor: bgColor },
      ]}
    >
      <View style={styles.navbar}>
        <AnimatedSvg
          width={width}
          height={70}
          style={[
            StyleSheet.absoluteFillObject,
            { transform: [{ translateX }] },
          ]}
        >
          <Path
            d={`M0,0 L${ITEM_WIDTH},0 C${ITEM_WIDTH + 30},0 ${
              ITEM_WIDTH + 30
            },35 ${ITEM_WIDTH},35 C${ITEM_WIDTH - 30},35 ${
              ITEM_WIDTH - 30
            },70 ${ITEM_WIDTH},70 L0,70 Z`}
            fill={isDarkMode ? "#2E2E2E" : "#f0e6ff"}
          />
        </AnimatedSvg>
        {screens.map((screen, index) => (
          <NavbarItem
            key={screen.name}
            iconName={screen.icon}
            isActive={index === activeScreenIndex}
            onPress={() => navigation.navigate(screen.name)}
            itemIndex={index}
            color={index === activeScreenIndex ? activeColor : fgColor}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navbar: {
    flexDirection: "row",
    height: 70,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Navbar;
