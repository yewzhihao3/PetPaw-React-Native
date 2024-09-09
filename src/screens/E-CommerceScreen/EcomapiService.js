import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, WS_BASE_URL } from "../../config";

const GOOGLE_MAPS_API_KEY = "AIzaSyDMk6B-XVLm3y86H7HCNxiJCAR4kUsZ6pM";

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // Increase to 60 seconds
});

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

const fetchUserOrders = async (token) => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) {
      throw new Error("User ID not found");
    }
    const response = await fetch(`${API_URL}/orders/user/${userId}`, {
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

export {
  createOrder,
  getUserData,
  getUserAddresses,
  fetchLatestOrder,
  fetchOrderById,
  fetchProducts,
  getRiderData,
  fetchRiderLocation,
  fetchUserOrders,
  getDriverData,
  getDirections,
};
