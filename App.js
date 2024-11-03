import React, { useEffect, useState } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { store } from "./store";
import Navbar from "./src/components/HomeScreen/Navbar";
import { ThemeProvider } from "./theme/Themecontext";
import { RiderStatusProvider } from "./src/screens/RiderScreen/RiderStatusContext";
import { RiderLocationProvider } from "./src/screens/RiderScreen/RiderLocationContext";
import { LocationNotificationManager } from "./src/screens/RiderScreen/LocationNotificationManager";
import { FontAwesome5 } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Import all screens
import OpeningScreen from "./src/screens/OnboardingScreen/Opening";
import LogInScreen from "./src/screens/LoginScreen/LogIn";
import SignUpScreen from "./src/screens/SignUpScreen/SignUp";
import OnboardingScreen from "./src/screens/OnboardingScreen/Onboarding";
import UserProfile from "./src/screens/HomeScreen/UserProfile";
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
import PetTaxiOrderConfirmation from "./src/screens/PetTaxiScreen/PetTaxiOrderConfirmation";
import MapPicker from "./src/screens/PetTaxiScreen/MapPicker";
import PetTaxiDelivery from "./src/screens/PetTaxiScreen/PetTaxiDelivery";
import PetTaxiMapView from "./src/screens/PetTaxiScreen/PetTaxiMapView";
import PetHome from "./src/screens/PetScreen/PetHome";
import PetProfile from "./src/screens/PetScreen/PetProfile";
import EditPetProfile from "./src/screens/PetScreen/EditPetProfile";
import AddPet from "./src/screens/PetScreen/AddPet";
import PetPrescription from "./src/screens/PetScreen/PetPrescription";
import PetMedicalRecord from "./src/screens/PetScreen/PetMedicalRecord";
import VetHome from "./src/screens/PetVeterinaryBookingScreen/VetHome";
import BookAppointment from "./src/screens/PetVeterinaryBookingScreen/BookAppointment";
import VetBookingConfirmation from "./src/screens/PetVeterinaryBookingScreen/VetBookingConfirmation";
import DateTimePicker from "./src/screens/PetVeterinaryBookingScreen/DateTimePicker";
import BookingList from "./src/screens/PetVeterinaryBookingScreen/BookingList";
import PetDiary from "./src/screens/PetScreen/PetDiary";
import DiaryList from "./src/screens/PetScreen/DiaryList";
import PetTips from "./src/screens/PetTipsScreen/PetTips";
import PetTipDetail from "./src/screens/PetTipsScreen/PetTipDetail";
import AIChat from "./src/screens/PetTipsScreen/AIChat";
import TrophyRoom from "./src/screens/TamagotchiGameScreen/TrophyRoom";
import PetHotelBooking from "./src/screens/PetHotelScreen/PetHotelBooking";
import DetailedBooking from "./src/screens/PetHotelScreen/DetailedBooking";
import BookingConfirmed from "./src/screens/PetHotelScreen/BookingConfirmed";
import GroomingService from "./src/screens/GroomingServiceScreen/GroomingService";
import BookingFlowScreen from "./src/screens/GroomingServiceScreen/BookingFlowScreen";
import BookingConfirmation from "./src/screens/GroomingServiceScreen/BookingConfirmation";
import Booking_History from "./src/screens/GroomingServiceScreen/Booking_History";

const Stack = createNativeStackNavigator();
const TamagotchiStack = createNativeStackNavigator();
const DriverTab = createBottomTabNavigator();

SplashScreen.preventAutoHideAsync();

function CheckLoginScreen({ navigation }) {
  useEffect(() => {
    const checkUser = async () => {
      try {
        const userToken = await AsyncStorage.getItem("userToken");
        const userRole = await AsyncStorage.getItem("userRole");

        if (userToken) {
          switch (userRole) {
            case "rider":
              await LocationNotificationManager.setupNotification();
              navigation.replace("RiderStack");
              break;
            case "driver":
              navigation.replace("DriverStack");
              break;
            default:
              navigation.replace("Home");
          }
        } else {
          navigation.replace("Login");
        }
      } catch (error) {
        console.error("Error checking user:", error);
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
      <TamagotchiStack.Screen name="TrophyRoom" component={TrophyRoom} />
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
    const navbarScreens = ["Home", "Tamagotchi", "PetHome", "UserProfile"];
    return navbarScreens.includes(routeName);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
          <Stack.Screen name="UserProfile" component={UserProfile} />
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
          <Stack.Screen
            name="PetTaxiPlaceOrder"
            component={PetTaxiPlaceOrder}
          />
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
          <Stack.Screen name="PetTaxiMapView" component={PetTaxiMapView} />
          <Stack.Screen name="PetHome" component={PetHome} />
          <Stack.Screen name="PetProfile" component={PetProfile} />
          <Stack.Screen name="EditPetProfile" component={EditPetProfile} />
          <Stack.Screen name="AddPet" component={AddPet} />
          <Stack.Screen name="PetPrescriptions" component={PetPrescription} />
          <Stack.Screen name="PetMedicalRecord" component={PetMedicalRecord} />
          <Stack.Screen name="VetHome" component={VetHome} />
          <Stack.Screen name="BookAppointment" component={BookAppointment} />
          <Stack.Screen
            name="VetBookingConfirmation"
            component={VetBookingConfirmation}
          />

          <Stack.Screen name="DateTimePicker" component={DateTimePicker} />
          <Stack.Screen name="BookingList" component={BookingList} />
          <Stack.Screen name="PetDiary" component={PetDiary} />
          <Stack.Screen
            name="DiaryList"
            component={DiaryList}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="PetTips" component={PetTips} />
          <Stack.Screen name="PetTipDetail" component={PetTipDetail} />
          <Stack.Screen name="AIChat" component={AIChat} />
          <Stack.Screen name="PetHotelBooking" component={PetHotelBooking} />
          <Stack.Screen name="DetailedBooking" component={DetailedBooking} />
          <Stack.Screen name="BookingConfirmed" component={BookingConfirmed} />
          <Stack.Screen name="GroomingService" component={GroomingService} />
          <Stack.Screen
            name="BookingFlowScreen"
            component={BookingFlowScreen}
          />
          <Stack.Screen
            name="BookingConfirmation"
            component={BookingConfirmation}
          />
          <Stack.Screen name="Booking_History" component={Booking_History} />
        </Stack.Navigator>

        {shouldShowNavbar(currentRouteName) && (
          <Navbar currentRoute={currentRouteName} />
        )}
      </View>
    </GestureHandlerRootView>
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
