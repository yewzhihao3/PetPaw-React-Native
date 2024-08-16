import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, TouchableOpacity, Text } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRiderStatus } from "./RiderStatusContext";
import { useRiderLocation } from "./RiderLocationContext";

import RiderHome from "./RiderHome";
import RiderOrders from "./RiderOrders";
import RiderHistory from "./RiderHistory";
import RiderProfile from "./RiderProfile";

const RiderTab = createBottomTabNavigator();

function RiderHomeWrapper() {
  const { location, errorMsg, refreshLocation } = useRiderLocation();

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 20, backgroundColor: "#f0f0f0" }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          Rider Location:
        </Text>
        {location ? (
          <View>
            <Text>Latitude: {location.coords.latitude.toFixed(6)}</Text>
            <Text>Longitude: {location.coords.longitude.toFixed(6)}</Text>
          </View>
        ) : (
          <Text>Waiting for location...</Text>
        )}
        {errorMsg && <Text style={{ color: "red" }}>Error: {errorMsg}</Text>}
        <TouchableOpacity
          onPress={refreshLocation}
          style={{
            marginTop: 10,
            padding: 10,
            backgroundColor: "#5E17EB",
            borderRadius: 5,
          }}
        >
          <Text style={{ color: "white" }}>Refresh Location</Text>
        </TouchableOpacity>
      </View>
      <RiderHome />
    </View>
  );
}

function RiderNavigator() {
  const { isOnline } = useRiderStatus();

  const CustomTabBarButton = (props) => {
    const { children, onPress, accessibilityState, label } = props;
    const focused = accessibilityState.selected;

    return (
      <TouchableOpacity
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 8,
          opacity: props.isOrdersTab && !isOnline ? 0.5 : 1,
        }}
        onPress={onPress}
        disabled={props.disabled}
      >
        <View
          style={{
            padding: 10,
            paddingHorizontal: 18,
          }}
        >
          {children}
        </View>
        <Text
          style={{
            color: focused ? "#5E17EB" : "#888",
            fontSize: 12,
            fontWeight: "600",
            marginTop: 4,
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <RiderTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Orders") {
            iconName = "clipboard-list";
          } else if (route.name === "History") {
            iconName = "history";
          } else if (route.name === "Profile") {
            iconName = "user-alt";
          }

          return (
            <FontAwesome5
              name={iconName}
              size={focused ? 24 : 20}
              color={focused ? "#5E17EB" : "#888"}
            />
          );
        },
        tabBarActiveTintColor: "#5E17EB",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: {
          height: 80,
          backgroundColor: "white",
          borderTopWidth: 0,
          elevation: 8,
          shadowOpacity: 0.1,
          shadowRadius: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          borderRadius: 20,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarShowLabel: false,
        tabBarButton: (props) => (
          <CustomTabBarButton
            {...props}
            label={route.name}
            isOrdersTab={route.name === "Orders"}
          />
        ),
      })}
    >
      <RiderTab.Screen name="Home" component={RiderHome} />
      <RiderTab.Screen
        name="Orders"
        options={{
          tabBarButton: (props) => (
            <CustomTabBarButton
              {...props}
              disabled={!isOnline}
              label="Orders"
              isOrdersTab={true}
            />
          ),
        }}
        component={RiderOrders}
      />
      <RiderTab.Screen name="History" component={RiderHistory} />
      <RiderTab.Screen name="Profile" component={RiderProfile} />
    </RiderTab.Navigator>
  );
}

export default RiderNavigator;
