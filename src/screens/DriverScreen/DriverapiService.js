import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, WS_BASE_URL } from "../../config";
import * as Location from "expo-location";

const GOOGLE_MAPS_API_KEY = "AIzaSyDMk6B-XVLm3y86H7HCNxiJCAR4kUsZ6pM";

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // Increase to 60 seconds
});

const acceptRide = async (rideId, driverId, token) => {
  try {
    console.log(`Driver ${driverId} attempting to accept ride ${rideId}`);
    const response = await api.post(
      `/pet-taxi/rides/${rideId}/accept?driver_id=${driverId}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Ride acceptance response:", response.data);
    const parsedData = {
      ...response.data,
      fare: response.data.fare != null ? parseFloat(response.data.fare) : null,
    };
    return parsedData;
  } catch (error) {
    console.error(
      "Error accepting ride:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const updateRideStatus = async (rideId, newStatus, token) => {
  try {
    console.log("Updating ride status with data:", {
      rideId,
      newStatus,
      token,
    });
    const data = {
      status: newStatus,
      driver_id: await AsyncStorage.getItem("driverId"), // Add this line
    };
    console.log("Request body:", JSON.stringify(data));
    const response = await api.put(
      `/pet-taxi/rides/${rideId}/update_status`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Update ride status response:", response.data);
    const parsedData = {
      ...response.data,
      fare: response.data.fare != null ? parseFloat(response.data.fare) : null,
    };
    return parsedData;
  } catch (error) {
    console.error(
      "Error updating ride status:",
      error.response?.data || error.message
    );
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
    const data = await response.json();
    console.log("Driver transactions data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching driver transactions:", error);
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
    const response = await api.get("/pet-taxi/rides", {
      headers: { Authorization: `Bearer ${token}` },
      params: { status: "PENDING,ACCEPTED,IN_PROGRESS,CANCELLED" },
    });
    console.log("API response for rides:", response.data);
    return response.data.map((ride) => ({
      ...ride,
      fare: parseFloat(ride.fare || 0),
    }));
  } catch (error) {
    console.error("Error fetching pending rides:", error);
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

export {
  acceptRide,
  updateRideStatus,
  getStoredDriverData,
  getDriverTransactions,
  getDriverData,
  updateDriverStatus,
  getPendingRides,
  updateDriverLocation,
  getCurrentLocationForDriver,
};
