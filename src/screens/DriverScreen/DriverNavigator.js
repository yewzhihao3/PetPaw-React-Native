import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5 } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import DriverHome from "./DriverHome";
import DriverRides from "./DriverRides";
import DriverHistory from "./DriverHistory";
import DriverProfile from "./DriverProfile";
import { DriverStatusContext } from "./DriverStatusContext";

const Tab = createBottomTabNavigator();

function DriverNavigator() {
  // Accessing the isOnline state from the DriverStatusContext
  const { isOnline } = useContext(DriverStatusContext);

  return (
    <DriverStatusProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === "Home") {
              iconName = "home";
            } else if (route.name === "Rides") {
              iconName = "car";
            } else if (route.name === "History") {
              iconName = "history";
            } else if (route.name === "Profile") {
              iconName = "user";
            }
            return <FontAwesome5 name={iconName} size={size} color={color} />;
          },
        })}
        tabBarOptions={{
          activeTintColor: "#5E17EB",
          inactiveTintColor: "gray",
        }}
      >
        <Tab.Screen name="Home" component={DriverHome} />
        <Tab.Screen
          name="Rides"
          component={DriverRides}
          options={{
            tabBarButton: (props) => (
              <TouchableOpacity
                {...props}
                disabled={!isOnline} // Disable the button if the driver is not online
                style={{ opacity: isOnline ? 1 : 0.5 }} // Set opacity based on online status
              />
            ),
          }}
        />
        <Tab.Screen name="History" component={DriverHistory} />
        <Tab.Screen name="Profile" component={DriverProfile} />
      </Tab.Navigator>
    </DriverStatusProvider>
  );
}

export default DriverNavigator;
