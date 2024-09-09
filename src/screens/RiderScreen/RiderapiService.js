import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, WS_BASE_URL } from "../../config";
import * as Location from "expo-location";

const GOOGLE_MAPS_API_KEY = "AIzaSyDMk6B-XVLm3y86H7HCNxiJCAR4kUsZ6pM";

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // Increase to 60 seconds
});

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

export {
  fetchOrderHistory,
  fetchOrders,
  getStoredRiderData,
  getRiderData,
  updateRiderLocation,
  fetchProducts,
  updateOrderStatus,
};
