import React, { useEffect } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import {
  NavigationContainer,
  useNavigationState,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider } from "react-redux";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { store } from "./store";
import Navbar from "./src/components/HomeScreen/Navbar";
import { ThemeProvider } from "./theme/Themecontext";
import { getUserData, logStoredData } from "./src/utils/asyncStorageUtils";
import { RiderStatusProvider } from "./src/screens/RiderScreen/RiderStatusContext";
import { RiderLocationProvider } from "./src/screens/RiderScreen/RiderLocationContext";
import { LocationNotificationManager } from "./src/screens/RiderScreen/LocationNotificationManager";
import { FontAwesome5 } from "@expo/vector-icons";

// Import all screens
import OpeningScreen from "./src/screens/OnboardingScreen/Opening";
import LogInScreen from "./src/screens/LoginScreen/LogIn";
import SignUpScreen from "./src/screens/SignUpScreen/SignUp";
import OnboardingScreen from "./src/screens/OnboardingScreen/Onboarding";
import DataScreen from "./src/screens/API/DataScreen";
import HomeScreen from "./src/screens/HomeScreen/Home";
import EHomeScreen from "./src/screens/E-CommerceScreen/EHome";
import EStoreScreen from "./src/screens/E-CommerceScreen/EStore";
import OrderList from "./src/screens/E-CommerceScreen/OrderList";
import CartScreen from "./src/screens/E-CommerceScreen/Cart";
import OrderPreparingScreen from "./src/screens/E-CommerceScreen/OrderPreparing";
import DeliveryScreen from "./src/screens/E-CommerceScreen/Delivery";
import TamagotchiGame from "./src/screens/TamagotchiGameScreen/Tamagotchigame";
import PetDiaryScreen from "./src/screens/TamagotchiGameScreen/PetDiary";
import AddPetScreen from "./src/screens/TamagotchiGameScreen/AddPet";
import TamagotchiOnboarding from "./src/screens/TamagotchiGameScreen/TamagotchiOnboarding";
import RiderNavigator from "./src/screens/RiderScreen/RiderNavigator";
import AddAddressScreen from "./src/components/HomeScreen/AddAddressScreen";

import DriverHome from "./src/screens/DriverScreen/DriverHome";
import DriverRides from "./src/screens/DriverScreen/DriverRides";
import DriverHistory from "./src/screens/DriverScreen/DriverHistory";
import DriverProfile from "./src/screens/DriverScreen/DriverProfile";
import { DriverStatusProvider } from "./src/screens/DriverScreen/DriverStatusContext";

import PetTaxiHome from "./src/screens/PetTaxiScreen/PetTaxiHome";
import PetTaxiPlaceOrder from "./src/screens/PetTaxiScreen/PetTaxiPlaceOrder";
import PetTaxiOrderConfirmation from "./src/screens/PetTaxiScreen/PetTaxiOderConfirmation";
import MapPicker from "./src/screens/PetTaxiScreen/MapPicker";
import PetTaxiDelivery from "./src/screens/PetTaxiScreen/PetTaxiDelivery";

const Stack = createNativeStackNavigator();
const TamagotchiStack = createNativeStackNavigator();
const DriverTab = createBottomTabNavigator();

SplashScreen.preventAutoHideAsync();

function CheckLoginScreen({ navigation }) {
  useEffect(() => {
    const checkUser = async () => {
      await logStoredData();
      const user = await getUserData();
      if (user?.userToken && user?.userId) {
        if (user.role === "rider") {
          await LocationNotificationManager.setupNotification();
          navigation.replace("RiderStack");
        } else if (user.role === "driver") {
          navigation.replace("DriverStack");
        } else {
          navigation.replace("Home");
        }
      } else {
        navigation.replace("Login");
      }
    };
    checkUser();
  }, [navigation]);

  return null;
}

function DriverStack() {
  return (
    <DriverStatusProvider>
      <DriverTab.Navigator
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
          tabBarActiveTintColor: "#5E17EB",
          tabBarInactiveTintColor: "gray",
          headerShown: false,
        })}
      >
        <DriverTab.Screen name="Home" component={DriverHome} />
        <DriverTab.Screen name="Rides" component={DriverRides} />
        <DriverTab.Screen name="History" component={DriverHistory} />
        <DriverTab.Screen name="Profile" component={DriverProfile} />
      </DriverTab.Navigator>
    </DriverStatusProvider>
  );
}

function TamagotchiNavigator() {
  return (
    <TamagotchiStack.Navigator screenOptions={{ headerShown: false }}>
      <TamagotchiStack.Screen
        name="TamagotchiMain"
        component={TamagotchiGame}
      />
      <TamagotchiStack.Screen name="AddPet" component={AddPetScreen} />
      <TamagotchiStack.Screen name="PetDiary" component={PetDiaryScreen} />
      <TamagotchiStack.Screen
        name="TamagotchiOnboarding"
        component={TamagotchiOnboarding}
      />
    </TamagotchiStack.Navigator>
  );
}

function RiderStack() {
  return <RiderNavigator />;
}

function MainNavigator() {
  const navigationState = useNavigationState((state) => state);
  const currentRouteName = navigationState?.routes[navigationState.index]?.name;

  const shouldShowNavbar = (routeName) => {
    const navbarScreens = ["Home", "Tamagotchi", "ECommerce", "DataScreen"];
    return navbarScreens.includes(routeName);
  };

  return (
    <View style={styles.container}>
      <Stack.Navigator
        initialRouteName="CheckLogin"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="CheckLogin" component={CheckLoginScreen} />
        <Stack.Screen name="Login" component={LogInScreen} />
        <Stack.Screen name="tips" component={OnboardingScreen} />
        <Stack.Screen name="start" component={OpeningScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="DataScreen" component={DataScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ECommerce" component={EHomeScreen} />
        <Stack.Screen name="EStore" component={EStoreScreen} />
        <Stack.Screen name="OrderList" component={OrderList} />
        <Stack.Screen
          name="Cart"
          options={{ presentation: "modal" }}
          component={CartScreen}
        />
        <Stack.Screen
          name="OrderPreparing"
          options={{ presentation: "fullScreenModal" }}
          component={OrderPreparingScreen}
        />
        <Stack.Screen
          name="Delivery"
          options={{ presentation: "fullScreenModal" }}
          component={DeliveryScreen}
        />
        <Stack.Screen name="Tamagotchi" component={TamagotchiNavigator} />
        <Stack.Screen name="AddAddress" component={AddAddressScreen} />
        <Stack.Screen name="RiderStack" component={RiderStack} />
        <Stack.Screen name="DriverStack" component={DriverStack} />

        <Stack.Screen name="PetTaxiHome" component={PetTaxiHome} />
        <Stack.Screen name="PetTaxiPlaceOrder" component={PetTaxiPlaceOrder} />
        <Stack.Screen
          name="PetTaxiOrderConfirmation"
          component={PetTaxiOrderConfirmation}
        />
        <Stack.Screen
          name="MapPicker"
          component={MapPicker}
          options={{ presentation: "modal" }}
        />
        <Stack.Screen name="PetTaxiDelivery" component={PetTaxiDelivery} />
      </Stack.Navigator>
      {shouldShowNavbar(currentRouteName) && (
        <Navbar currentRoute={currentRouteName} />
      )}
    </View>
  );
}

function App() {
  useEffect(() => {
    const setup = async () => {
      try {
        await SplashScreen.hideAsync();
        await LocationNotificationManager.setupNotification();
      } catch (e) {
        console.warn("Error during app setup:", e);
      }
    };
    setup();
    return () => {
      LocationNotificationManager.cancelNotification();
    };
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" />
          <NavigationContainer>
            <RiderStatusProvider>
              <RiderLocationProvider>
                <MainNavigator />
              </RiderLocationProvider>
            </RiderStatusProvider>
          </NavigationContainer>
        </SafeAreaProvider>
      </ThemeProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});

export default App;
