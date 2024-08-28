import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, WS_BASE_URL } from "../../config";
import * as Location from "expo-location";

const GOOGLE_MAPS_API_KEY = "AIzaSyDMk6B-XVLm3y86H7HCNxiJCAR4kUsZ6pM";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Increase to 30 seconds
});

// Error handling function
const handleApiError = (error, customMessage) => {
  if (error.response) {
    console.error(`${customMessage}:`, error.response.data);
    console.error(`Status code: ${error.response.status}`);
  } else if (error.request) {
    console.error(`${customMessage}: No response received`);
  } else {
    console.error(`${customMessage}:`, error.message);
  }
  throw error;
};

// User Authentication and Management
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
      response.data.profile_picture = `${API_URL}/${response.data.profile_picture.replace(
        "http://192.168.100.18:8000/",
        ""
      )}`;
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

// Rider Management
const getRiderData = async (rider_id, token) => {
  try {
    console.log(`Fetching rider data for rider ID: ${rider_id}`);
    console.log(`Using token: ${token}`);
    const response = await api.get(`/riders/${rider_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Full API response:", response);
    console.log("Rider data response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching rider data:");
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      console.error("Request:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    console.error("Error config:", error.config);
    throw error;
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

const getStoredRiderData = async () => {
  try {
    const token = await AsyncStorage.getItem("riderToken");
    const riderId = await AsyncStorage.getItem("riderId");
    return { token, riderId };
  } catch (error) {
    console.error("Error getting stored rider data:", error);
    return { token: null, riderId: null };
  }
};

const updateRiderLocation = async (riderId, latitude, longitude, token) => {
  try {
    console.log("Sending location update to API:", {
      riderId,
      latitude,
      longitude,
    });
    const response = await api.post(
      "/riders/location",
      {
        rider_id: riderId,
        latitude: latitude,
        longitude: longitude,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Location update API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating rider location:", error);
    handleApiError(error, "Error updating rider location");
  }
};

const fetchRiderLocation = async (riderId, token) => {
  try {
    const response = await api.get(`/riders/location/${riderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Rider location API response:", response.data);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log("Rider location not found. Returning null.");
      return null;
    }
    console.error("Error fetching rider location:", error);
    throw error;
  }
};

// Order Management
const createOrder = async (orderData, token) => {
  try {
    const updatedOrderData = {
      ...orderData,
      status: orderData.status ? orderData.status.toUpperCase() : "PENDING",
    };

    console.log("Creating order with data:", JSON.stringify(updatedOrderData));
    console.log("Using token:", token);

    const response = await api.post("/orders/", updatedOrderData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Order creation response:", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error("Error in createOrder:", error);
    if (error.response) {
      console.error("Response data:", JSON.stringify(error.response.data));
      console.error("Response status:", error.response.status);
      console.error(
        "Response headers:",
        JSON.stringify(error.response.headers)
      );
    }
    throw error;
  }
};

const fetchLatestOrder = async (token) => {
  try {
    const response = await api.get("/orders/latest", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching latest order:", error);
    throw error;
  }
};

const updateOrderStatus = async (orderId, statusUpdate, token) => {
  try {
    console.log("Sending status update to API:", JSON.stringify(statusUpdate));
    console.log("Order ID:", orderId);
    console.log("Token:", token);

    const validStatuses = [
      "PENDING",
      "ACCEPTED",
      "RIDER_ACCEPTED",
      "ON_THE_WAY",
      "DELIVERED",
      "CANCELLED",
    ];
    if (!validStatuses.includes(statusUpdate.status)) {
      throw new Error(`Invalid status: ${statusUpdate.status}`);
    }

    const response = await api.put(
      `/orders/${orderId}/update_status`,
      statusUpdate,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("API response:", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    if (error.response) {
      console.error("Response data:", JSON.stringify(error.response.data));
      console.error("Response status:", error.response.status);
      console.error(
        "Response headers:",
        JSON.stringify(error.response.headers)
      );
    } else if (error.request) {
      console.error("No response received:", JSON.stringify(error.request));
    } else {
      console.error("Error message:", error.message);
    }
    throw error;
  }
};

const fetchOrders = async (token, orderId = null) => {
  try {
    const url = orderId ? `/orders/${orderId}` : "/orders";
    const response = await api.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, "Error fetching orders");
  }
};

const fetchUserOrders = async (token) => {
  try {
    const response = await fetch(`${API_URL}/orders/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
};

const fetchOrderById = async (orderId, token) => {
  try {
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};

const fetchOrderHistory = async (token, riderId) => {
  try {
    const response = await api.get("/orders/history", {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        rider_id: riderId,
        status: ["DELIVERED", "CANCELLED"],
      },
    });
    console.log("Order history response:", response.data);
    return response.data;
  } catch (error) {
    handleApiError(error, "Error fetching order history");
  }
};

// Product Management
const fetchProducts = async (token) => {
  try {
    const response = await api.get("/products", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, "Error fetching products");
  }
};

// Address Management
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

const getUserAddresses = async (userId) => {
  try {
    const response = await api.get(`/addresses/user/${userId}`);
    console.log("Addresses fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in getUserAddresses:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    console.warn("Returning empty array due to error");
    return [];
  }
};

// Directions
const getDirections = async (startLat, startLng, endLat, endLng) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${startLat},${startLng}&destination=${endLat},${endLng}&key=${GOOGLE_MAPS_API_KEY}`
    );
    console.log("Directions API response:", response.data);
    return response.data;
  } catch (error) {
    handleApiError(error, "Error fetching directions");
  }
};

// Driver Management
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

const getDriverData = async (driverId, token) => {
  try {
    console.log(`Fetching driver data for driver ID: ${driverId}`);
    console.log(`Using token: ${token}`);
    const response = await fetch(`${API_URL}/drivers/${driverId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Driver data response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching driver data:", error);
    throw error;
  }
};

const getStoredDriverData = async () => {
  try {
    const token = await AsyncStorage.getItem("driverToken");
    const driverId = await AsyncStorage.getItem("driverId");
    return { token, driverId };
  } catch (error) {
    console.error("Error getting stored driver data:", error);
    return { token: null, driverId: null };
  }
};

const updateDriverStatus = async (driverId, status, token) => {
  try {
    const response = await api.put(
      `/drivers/${driverId}/status`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating driver status:", error);
    throw error;
  }
};

const getPendingRides = async (token) => {
  try {
    const response = await fetch(`${API_URL}/pet-taxi/rides?status=PENDING`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching pending rides:", error);
    throw error;
  }
};

const getDriverTransactions = async (driverId, token) => {
  try {
    const response = await fetch(
      `${API_URL}/pet-taxi/rides/driver/${driverId}?status=COMPLETED`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching driver transactions:", error);
    throw error;
  }
};

// Connection test
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

const getUserPetTaxiRides = async (token) => {
  try {
    const response = await api.get("/pet-taxi/rides", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, "Error fetching user's pet taxi rides");
  }
};

const createPetTaxiRide = async (rideData) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const userId = await AsyncStorage.getItem("userId");

    if (!token || !userId) {
      throw new Error("User not authenticated");
    }

    const completeRideData = {
      ...rideData,
      user_id: parseInt(userId),
      fare: parseFloat(rideData.fare),
    };

    const response = await api.post("/pet-taxi/rides", completeRideData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, "Error creating pet taxi ride");
  }
};

const fetchPetTaxiRideById = async (rideId, token) => {
  try {
    const response = await api.get(`/pet-taxi/rides/${rideId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching pet taxi ride:", error.response?.data);
    console.error("Status code:", error.response?.status);
    throw error;
  }
};

const fetchDriverLocation = async (driverId, token) => {
  try {
    const response = await api.get(`/pet-taxi/driver-location/${driverId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, "Error fetching driver location");
  }
};

const getCurrentLocationForDriver = async () => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Permission to access location was denied");
    }

    let location = await Location.getCurrentPositionAsync({});
    return location;
  } catch (error) {
    console.error("Error getting current location:", error);
    throw error;
  }
};

const updateDriverLocation = async (driverId, latitude, longitude, token) => {
  try {
    const response = await api.put(
      `/drivers/${driverId}/location`,
      { latitude, longitude },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating driver location:", error);
    throw error;
  }
};

// Export all functions
export {
  // User Authentication and Management
  signUp,
  login,
  getUserData,

  // Rider Management
  getRiderData,
  riderLogin,
  getStoredRiderData,
  updateRiderLocation,
  fetchRiderLocation,

  // Order Management
  createOrder,
  updateOrderStatus,
  fetchOrders,
  fetchOrderHistory,
  fetchLatestOrder,
  fetchUserOrders,
  fetchOrderById,

  // Product Management
  fetchProducts,

  // Address Management
  geocodeAddress,
  createUserAddress,
  getUserAddresses,

  // Directions
  getDirections,

  // Driver Management
  driverLogin,
  getDriverData,
  getStoredDriverData,
  updateDriverStatus,
  getPendingRides,
  getDriverTransactions,

  // Connection test
  testServerConnection,

  // PetTaxi Management
  getUserPetTaxiRides,
  createPetTaxiRide,
  fetchPetTaxiRideById,
  fetchDriverLocation,
  getCurrentLocationForDriver,
  updateDriverLocation,
};
