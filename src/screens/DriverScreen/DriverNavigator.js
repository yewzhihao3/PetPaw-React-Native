import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import DriverHomeScreen from "./DriverHome";
import DriverOrdersScreen from "./DriverOrders";
import DriverHistoryScreen from "./DriverHistory";
import DriverDetailsScreen from "./DriverDetails";
import { DriverStatusProvider } from "./DriverStatusContext";
import { DriverLocationProvider } from "./DriverLocationContext";

const Tab = createBottomTabNavigator();

function DriverTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "DriverHome") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "DriverOrders") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "DriverHistory") {
            iconName = focused ? "time" : "time-outline";
          } else if (route.name === "DriverProfile") {
            iconName = focused ? "person" : "person-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="DriverHome"
        component={DriverHomeScreen}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="DriverOrders"
        component={DriverOrdersScreen}
        options={{ title: "Orders" }}
      />
      <Tab.Screen
        name="DriverHistory"
        component={DriverHistoryScreen}
        options={{ title: "History" }}
      />
      <Tab.Screen
        name="DriverProfile"
        component={DriverDetailsScreen}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
}

function DriverNavigator() {
  return (
    <DriverStatusProvider>
      <DriverLocationProvider>
        <DriverTabs />
      </DriverLocationProvider>
    </DriverStatusProvider>
  );
}

export default DriverNavigator;
