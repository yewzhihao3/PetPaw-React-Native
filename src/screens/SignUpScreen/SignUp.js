import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { signUp } from "../API/apiService"; // Import the signUp function

export default function SignUpScreen() {
  const navigation = useNavigation();
  const [profileImage, setProfileImage] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const selectImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage({ uri: result.assets[0].uri });
    }
  };

  const handleSignUp = async () => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("name", username);
    formData.append("phone_number", phoneNumber);
    formData.append("password", password);

    if (profileImage) {
      const filename = profileImage.uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append("profile_picture", {
        uri: profileImage.uri,
        name: filename,
        type,
      });
    }

    try {
      await signUp(formData);
      navigation.push("Login");
    } catch (error) {
      console.error("Error signing up: ", error);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="bg-white h-full w-full">
        <StatusBar style="light" />
        <Image
          className="h-full w-full absolute"
          source={require("../../../assets/Login/background.png")}
        />

        {/* paws */}
        <View className="flex-row justify-around w-full absolute">
          <Animated.Image
            entering={FadeInUp.delay(200).duration(1000).springify().damping(3)}
            className="h-[225] w-[100] "
            source={require("../../../assets/Login/PAW1.png")}
          />
          <Animated.Image
            entering={FadeInUp.delay(400).duration(1000).springify().damping(4)}
            className="h-[160] w-[65] "
            source={require("../../../assets/Login/PAW2.png")}
          />
        </View>

        {/*Title and Form*/}
        <View className="h-full w-full flex justify-around pt-32">
          {/* Title */}
          <View className="flex items-center ">
            <Animated.Text
              entering={FadeInUp.duration(1000).springify()}
              className=" text-white font-bold tracking-wider text-5xl "
            >
              Sign Up
            </Animated.Text>
          </View>
          {/* Form */}
          <View className="flex items-center mx-5 space-y-3">
            <TouchableOpacity onPress={selectImage}>
              <View className="items-center">
                {profileImage ? (
                  <Image
                    source={profileImage}
                    style={{ width: 150, height: 150, borderRadius: 75 }}
                  />
                ) : (
                  <View
                    className="border-4 border-violet-700"
                    style={{
                      width: 150,
                      height: 150,
                      borderRadius: 75,
                      backgroundColor: "#FFF",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text className="font-bold text-violet-700">
                      Upload Image
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <Animated.View
              entering={FadeInDown.duration(1000).delay(100).springify()}
              className="bg-black/5 p-3 rounded-2xl w-full mb-1"
            >
              <TextInput
                placeholder="Username"
                placeholderTextColor={"purple"}
                value={username}
                onChangeText={setUsername}
              />
            </Animated.View>
            <Animated.View
              entering={FadeInDown.duration(1000).delay(200).springify()}
              className="bg-black/5 p-3 rounded-2xl w-full mb-1"
            >
              <TextInput
                placeholder="Email"
                placeholderTextColor={"purple"}
                value={email}
                onChangeText={setEmail}
              />
            </Animated.View>
            <Animated.View
              entering={FadeInDown.duration(1000).delay(300).springify()}
              className="bg-black/5 p-3 rounded-2xl w-full mb-1 pb-3"
            >
              <TextInput
                placeholder="Phone Number"
                placeholderTextColor={"purple"}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </Animated.View>
            <Animated.View
              entering={FadeInDown.duration(1000).delay(400).springify()}
              className="bg-black/5 p-3 rounded-2xl w-full mb-1 pb-3"
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
              entering={FadeInDown.duration(1000).delay(800).springify()}
              className="w-full"
            >
              <TouchableOpacity
                className="w-full bg-violet-700 p-3 rounded-2xl mb-6"
                onPress={handleSignUp}
              >
                <Text className="text-xl font-bold text-white text-center">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </Animated.View>
            <Animated.View
              entering={FadeInDown.duration(1000).springify()}
              className="flex-row justify-center"
            >
              <Text className="text-gray-600"> Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.push("Login")}>
                <Text className="text-violet-950 font-bold"> Login</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
