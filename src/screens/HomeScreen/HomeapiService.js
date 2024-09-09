import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, WS_BASE_URL } from "../../config";

const GOOGLE_MAPS_API_KEY = "AIzaSyDMk6B-XVLm3y86H7HCNxiJCAR4kUsZ6pM";

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // Increase to 60 seconds
});

const testServerConnection = async () => {
  try {
    const response = await fetch(`${API_URL}/`);
    const data = await response.text();
    console.log("Server test response:", data);
    return true;
  } catch (error) {
    console.error("Error testing server connection:", error);
    return false;
  }
};

const getUserData = async (userId, token) => {
  try {
    console.log(
      `Fetching user data for user ID: ${userId} with token: ${token}`
    );
    const response = await api.get(`/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("User data response:", response.data);

    // Fix the profile picture URL
    if (
      response.data.profile_picture &&
      !response.data.profile_picture.startsWith("http")
    ) {
      response.data.profile_picture = `${API_URL}/${response.data.profile_picture.replace()}`;
    }

    return response.data;
  } catch (error) {
    console.error(
      "Get user data error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const login = async (email, password) => {
  try {
    console.log(`Attempting to login with email: ${email}`);
    console.log(`API URL: ${API_URL}`);
    const response = await api.post(
      "/login",
      new URLSearchParams({ username: email, password }),
      {
        timeout: 30000,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    console.log("Login response:", response);

    if (response.status === 200) {
      const { access_token, user_id, role } = response.data;

      await AsyncStorage.setItem("userToken", access_token);
      await AsyncStorage.setItem("userId", user_id.toString());
      await AsyncStorage.setItem("userRole", role || "user");

      return { access_token, user_id, role: role || "user" };
    } else {
      throw new Error(`Invalid response from server: ${response.status}`);
    }
  } catch (error) {
    console.error("Login error details:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
      console.error("Error status:", error.response.status);
      throw new Error(error.response.data.detail || "Login failed");
    } else if (error.request) {
      console.error("No response received. Request details:", error.request);
      throw new Error("No response received from server");
    } else {
      console.error("Error message:", error.message);
      throw error;
    }
  }
};

const riderLogin = async (email, password) => {
  try {
    const response = await api.post(
      "/rider/login",
      new URLSearchParams({ username: email, password })
    );

    if (response.status === 200) {
      const { access_token, user_id } = response.data;
      await AsyncStorage.setItem("riderToken", access_token);
      await AsyncStorage.setItem("riderId", user_id.toString());
      return { access_token, user_id, role: "rider" };
    } else {
      throw new Error("Invalid response from server");
    }
  } catch (error) {
    console.error("Rider login error:", error);
    throw error;
  }
};

const driverLogin = async (email, password) => {
  try {
    console.log(`Attempting driver login with email: ${email}`);
    console.log(`API URL: ${API_URL}`);

    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    console.log("Form data being sent:", formData.toString());

    const response = await api.post("/driver/login", formData.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
    });

    console.log("Driver login response status:", response.status);
    console.log("Driver login response data:", response.data);

    if (response.status === 200) {
      const { access_token, user_id, role } = response.data;
      await AsyncStorage.setItem("driverToken", access_token);
      await AsyncStorage.setItem("driverId", user_id.toString());
      return { access_token, user_id, role };
    } else {
      throw new Error(response.data.detail || "Driver login failed");
    }
  } catch (error) {
    console.error("Driver login error details:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
      console.error("Error status:", error.response.status);
      throw new Error(error.response.data.detail || "Driver login failed");
    } else if (error.request) {
      console.error("No response received. Request details:", error.request);
      throw new Error("No response received from server");
    } else {
      console.error("Error message:", error.message);
      throw error;
    }
  }
};

const signUp = async (formData) => {
  try {
    console.log("SignUp formData:", formData);
    const response = await api.post("/users/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("SignUp response:", response.data);
    return response.data;
  } catch (error) {
    handleApiError(error, "Sign Up error");
  }
};

const createUserAddress = async (userId, addressData, token) => {
  try {
    const response = await api.post(`/addresses/user/${userId}`, addressData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Address creation response:", response.data);
    return response.data;
  } catch (error) {
    handleApiError(error, "Error creating user address");
  }
};

const geocodeAddress = async (address) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.status === "OK") {
      const { lat, lng } = response.data.results[0].geometry.location;
      return { lat, lng };
    } else {
      throw new Error("Geocoding failed");
    }
  } catch (error) {
    handleApiError(error, "Error geocoding address");
  }
};

export {
  testServerConnection,
  getUserData,
  login,
  riderLogin,
  driverLogin,
  signUp,
  createUserAddress,
  geocodeAddress,
};
