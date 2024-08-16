import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Modal,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { login, riderLogin, driverLogin } from "../API/apiService";
import { logStoredData } from "../../utils/asyncStorageUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";

const clearOnboarding = async () => {
  try {
    await AsyncStorage.removeItem("@viewedOnboarding");
  } catch (err) {
    console.log("error @clearOnBoarding: ", err);
  }
};

const userTypes = [
  { label: "User", value: "user" },
  { label: "Rider", value: "rider" },
  { label: "Driver", value: "driver" },
];

export default function LogInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState(userTypes[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      console.log("Attempting login with email:", email, "password:", password);
      let response;
      switch (userType.value) {
        case "rider":
          response = await riderLogin(email, password);
          break;
        case "driver":
          response = await driverLogin(email, password);
          break;
        default:
          response = await login(email, password);
      }
      console.log("Login response:", response);
      const { access_token, user_id, role } = response;
      if (!access_token) {
        throw new Error("No access token received");
      }
      await AsyncStorage.setItem("userToken", access_token);
      await AsyncStorage.setItem("userId", user_id.toString());
      await AsyncStorage.setItem("userRole", role || userType.value);
      console.log(
        "Token, User ID, and Role saved:",
        access_token,
        user_id,
        role || userType.value
      );
      await logStoredData();
      if (role === "rider") {
        navigation.reset({
          index: 0,
          routes: [{ name: "RiderStack" }],
        });
      } else if (role === "driver") {
        navigation.reset({
          index: 0,
          routes: [{ name: "DriverStack" }],
        });
      } else {
        navigation.navigate("DataScreen");
      }
    } catch (err) {
      console.log("Login error:", err);
      setError("Invalid email or password");
    }
  };

  return (
    <View className="bg-white h-full w-full">
      <StatusBar barStyle="light" />
      <Image
        className="h-full w-full absolute"
        source={require("../../../assets/Login/background.png")}
      />

      <View className="flex-row justify-around w-full absolute">
        <Animated.Image
          entering={FadeInUp.delay(200).duration(1000).springify().damping(3)}
          className="h-[225] w-[100]"
          source={require("../../../assets/Login/PAW1.png")}
        />
        <Animated.Image
          entering={FadeInUp.delay(400).duration(1000).springify().damping(4)}
          className="h-[160] w-[65]"
          source={require("../../../assets/Login/PAW2.png")}
        />
      </View>

      <View className="h-full w-full flex justify-around pt-40 pb-10">
        <View className="flex items-center">
          <Animated.Text
            entering={FadeInUp.duration(500).springify()}
            className="text-white font-bold tracking-wider text-5xl"
          >
            Login
          </Animated.Text>
        </View>

        <View className="flex items-center mx-5 space-y-1">
          <Animated.View
            entering={FadeInDown.duration(500).delay(200).springify()}
            className="bg-black/5 p-5 rounded-2xl w-full"
          >
            <TextInput
              placeholder="Email"
              placeholderTextColor={"purple"}
              value={email}
              onChangeText={setEmail}
            />
          </Animated.View>
          <Animated.View
            entering={FadeInDown.duration(500).delay(400).springify()}
            className="bg-black/5 p-5 rounded-2xl w-full mb-3"
          >
            <TextInput
              placeholder="Password"
              placeholderTextColor={"purple"}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(500).delay(500).springify()}
            className="bg-black/5 p-5 rounded-2xl w-full mb-3"
          >
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text className="text-purple-700">{userType.label}</Text>
            </TouchableOpacity>
          </Animated.View>

          {error && <Text style={{ color: "red" }}>{error}</Text>}
          <Animated.View
            entering={FadeInDown.duration(500).delay(600).springify()}
            className="w-full"
          >
            <TouchableOpacity
              className="w-full bg-violet-700 p-3 rounded-2xl mb-3"
              onPress={handleLogin}
            >
              <Text className="text-xl font-bold text-white text-center">
                Login
              </Text>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View
            entering={FadeInDown.duration(500).springify()}
            className="flex-row justify-center"
          >
            <Text className="text-gray-600"> Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.push("SignUp")}>
              <Text className="text-violet-950 font-bold"> Sign Up</Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity onPress={clearOnboarding}>
            <Text className="text-violet-950 font-bold">Reset Onboarding</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.push("tips")}>
            <Text className="text-violet-950 font-bold">Replay Tips?</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-5">
            <FlatList
              data={userTypes}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="py-3 border-b border-gray-200"
                  onPress={() => {
                    setUserType(item);
                    setModalVisible(false);
                  }}
                >
                  <Text className="text-lg text-purple-700">{item.label}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.value}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
