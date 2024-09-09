import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, WS_BASE_URL } from "../../config";

const GOOGLE_MAPS_API_KEY = "AIzaSyDMk6B-XVLm3y86H7HCNxiJCAR4kUsZ6pM";

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // Increase to 60 seconds
});

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
    console.log("Driver location API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching driver location:", error);
    return null;
  }
};

const getUserPetTaxiRides = async (token) => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    const response = await api.get(`/pet-taxi/rides/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, "Error fetching user's pet taxi rides");
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

export {
  fetchPetTaxiRideById,
  fetchDriverLocation,
  getUserPetTaxiRides,
  getDriverData,
  getDirections,
  createPetTaxiRide,
};
