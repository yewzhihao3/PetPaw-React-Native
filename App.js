import React, { useEffect, useState } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import {
  NavigationContainer,
  useNavigationState,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider } from "react-redux";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { store } from "./store";
import { ThemeProvider } from "./theme/Themecontext";
import { getUserData, logStoredData } from "./src/utils/asyncStorageUtils";
import { RiderStatusProvider } from "./src/screens/RiderScreen/RiderStatusContext";
import { RiderLocationProvider } from "./src/screens/RiderScreen/RiderLocationContext";
import { LocationNotificationManager } from "./src/screens/RiderScreen/LocationNotificationManager";
import { DriverStatusProvider } from "./src/screens/DriverScreen/DriverStatusContext";
import { DriverLocationProvider } from "./src/screens/DriverScreen/DriverLocationContext";

// Components
import Navbar from "./src/components/HomeScreen/Navbar";
import LoadingScreen from "./src/components/LoadingScreen";

// Authentication Screens
import LogInScreen from "./src/screens/LoginScreen/LogIn";
import SignUpScreen from "./src/screens/SignUpScreen/SignUp";

// Onboarding Screens
import OpeningScreen from "./src/screens/OnboardingScreen/Opening";
import OnboardingScreen from "./src/screens/OnboardingScreen/Onboarding";

// Main App Screens
import DataScreen from "./src/screens/API/DataScreen";
import HomeScreen from "./src/screens/HomeScreen.js/Home";
import AddAddressScreen from "./src/components/HomeScreen/AddAddressScreen";

// E-Commerce Screens
import EHomeScreen from "./src/screens/E-CommerceScreen/EHome";
import EStoreScreen from "./src/screens/E-CommerceScreen/EStore";
import CartScreen from "./src/screens/E-CommerceScreen/Cart";
import OrderPreparingScreen from "./src/screens/E-CommerceScreen/OrderPreparing";
import DeliveryScreen from "./src/screens/E-CommerceScreen/Delivery";
import OrderList from "./src/screens/E-CommerceScreen/OrderList";

// Tamagotchi Screens
import TamagotchiGame from "./src/screens/TamagotchiGameScreen/Tamagotchigame";
import PetDiaryScreen from "./src/screens/TamagotchiGameScreen/PetDiary";
import AddPetScreen from "./src/screens/TamagotchiGameScreen/AddPet";
import TamagotchiOnboarding from "./src/screens/TamagotchiGameScreen/TamagotchiOnboarding";

// Rider Screens
import RiderNavigator from "./src/screens/RiderScreen/RiderNavigator";

// Driver Screens
import DriverNavigator from "./src/screens/DriverScreen/DriverNavigator";

const Stack = createNativeStackNavigator();
const TamagotchiStack = createNativeStackNavigator();

SplashScreen.preventAutoHideAsync();

// Check user login status
function CheckLoginScreen({ navigation }) {
  useEffect(() => {
    const checkUser = async () => {
      await logStoredData();
      const user = await getUserData();
      if (user?.userToken && user?.userId) {
        if (user.role === "rider") {
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

// Tamagotchi feature navigator
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

// Rider feature stack
function RiderStack() {
  return <RiderNavigator />;
}

// Driver feature stack
function DriverStack() {
  return <DriverNavigator />;
}

// Main navigation structure
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
        {/* Authentication and Onboarding */}
        <Stack.Screen name="CheckLogin" component={CheckLoginScreen} />
        <Stack.Screen name="Login" component={LogInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="tips" component={OnboardingScreen} />
        <Stack.Screen name="start" component={OpeningScreen} />

        {/* Main App Screens */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="DataScreen" component={DataScreen} />
        <Stack.Screen name="AddAddress" component={AddAddressScreen} />

        {/* E-Commerce Screens */}
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

        {/* Tamagotchi Feature */}
        <Stack.Screen name="Tamagotchi" component={TamagotchiNavigator} />

        {/* Rider Feature */}
        <Stack.Screen name="RiderStack" component={RiderStack} />

        {/* Driver Feature */}
        <Stack.Screen name="DriverStack" component={DriverStack} />
      </Stack.Navigator>
      {shouldShowNavbar(currentRouteName) && (
        <Navbar currentRoute={currentRouteName} />
      )}
    </View>
  );
}

function App() {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setup = async () => {
      try {
        await SplashScreen.hideAsync();
        const user = await getUserData();
        setUserRole(user?.role);
        if (user?.role === "rider") {
          await LocationNotificationManager.setupNotification();
        } else if (user?.role === "driver") {
          // Setup any driver-specific notifications if needed
          // await DriverLocationNotificationManager.setupNotification();
        }
      } catch (e) {
        console.warn("Error during app setup:", e);
      } finally {
        setIsLoading(false);
      }
    };

    setup();

    return () => {
      if (userRole === "rider") {
        LocationNotificationManager.cancelNotification();
      } else if (userRole === "driver") {
        // Cancel any driver-specific notifications if needed
        // DriverLocationNotificationManager.cancelNotification();
      }
    };
  }, [userRole]);

  if (isLoading) {
    // Show a loading screen
    return <LoadingScreen />;
  }

  return (
    <Provider store={store}>
      <ThemeProvider>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" />
          <NavigationContainer>
            {userRole === "rider" ? (
              <RiderStatusProvider>
                <RiderLocationProvider>
                  <MainNavigator />
                </RiderLocationProvider>
              </RiderStatusProvider>
            ) : userRole === "driver" ? (
              <MainNavigator />
            ) : (
              <MainNavigator />
            )}
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
