import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API Configuration
const API_URL = "http://0.0.0.0:8000";
const GOOGLE_MAPS_API_KEY = "AIzaSyDMk6B-XVLm3y86H7HCNxiJCAR4kUsZ6pM";
export const WS_BASE_URL = "ws:http://0.0.0.0:8000";

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
    } else if (error.request) {
      console.error("No response received. Request details:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    if (error.config) {
      console.error("Request config:", JSON.stringify(error.config, null, 2));
    }
    throw error;
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
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Request:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error message:", error.message);
    }
    console.error("Error config:", error.config);
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

// user fetch order list

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

// New function for fetching order history
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

// Rider Authentication
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

// Geocoding and Address Management
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
    // Instead of throwing, return an empty array or null
    console.warn("Returning empty array due to error");
    return [];
  }
};

// Directions and Location
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

const driverLogin = async (email, password) => {
  try {
    console.log(`Attempting to login driver with email: ${email}`);
    const response = await api.post(
      "/driver/login", // Changed from "/pet-taxi/driver/login"
      new URLSearchParams({ username: email, password }),
      {
        timeout: 30000,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    console.log("Driver Login response:", response);
    if (response.status === 200) {
      const { access_token, user_id, role } = response.data;
      return { access_token, user_id, role: role || "driver" };
    } else {
      throw new Error(`Invalid response from server: ${response.status}`);
    }
  } catch (error) {
    console.error("Driver Login error details:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
      console.error("Error status:", error.response.status);
    } else if (error.request) {
      console.error("No response received. Request details:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    if (error.config) {
      console.error("Request config:", JSON.stringify(error.config, null, 2));
    }
    throw error;
  }
};
const getDriverData = async (driverId, token) => {
  try {
    console.log(`Fetching driver data for driver ID: ${driverId}`);
    console.log(`Using token: ${token}`);
    const response = await api.get(`/pet-taxi/drivers/${driverId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Full API response:", response);
    console.log("Driver data response:", response.data);

    // Fix the profile picture URL if needed
    if (
      response.data.image_url &&
      !response.data.image_url.startsWith("http")
    ) {
      response.data.image_url = `${API_URL}/${response.data.image_url}`;
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching driver data:");
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

// Export all functions
export {
  // User Authentication and Management
  signUp,
  login,
  getUserData,
  getRiderData,

  // Order Management
  createOrder,
  updateOrderStatus,
  fetchOrders,
  fetchOrderHistory,
  fetchProducts,
  fetchLatestOrder,
  fetchUserOrders,
  fetchOrderById,

  // Rider Authentication
  riderLogin,
  getStoredRiderData,

  // Driver Authentication
  driverLogin,
  getDriverData,
  getStoredDriverData,

  // Geocoding and Address Management
  geocodeAddress,
  createUserAddress,
  getUserAddresses,

  // Directions and Location
  getDirections,
  fetchRiderLocation,
  updateRiderLocation,
};
