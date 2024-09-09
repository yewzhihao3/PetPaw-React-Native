import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, WS_BASE_URL } from "../../config";
import * as Location from "expo-location";

const GOOGLE_MAPS_API_KEY = "AIzaSyDMk6B-XVLm3y86H7HCNxiJCAR4kUsZ6pM";

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // Increase to 60 seconds
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

// Connection test

// Pet Taxi Management
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
    console.log("Driver location API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching driver location:", error);
    return null;
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

//Pet management

const getRefillRequestStatus = async (prescriptionId, token) => {
  try {
    const response = await api.get(
      `/prescriptions/refill/requests?prescription_id=${prescriptionId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.length > 0 ? response.data[0] : null;
  } catch (error) {
    console.error("Error fetching refill request status:", error);
    return null;
  }
};

//Pet Veterinary Booking Management
// Fetch available appointment slots
const getAvailableAppointmentSlots = async (date) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await api.get(`/appointments/available-slots`, {
      params: { date },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching available appointment slots:", error);
    throw error;
  }
};

// Fetch appointment details
const getAppointmentDetails = async (appointmentId) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await api.get(`/appointments/${appointmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching appointment details:", error);
    throw error;
  }
};

// Fetch Appointments by petID
const getAppointmentsByPetId = async (petId) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      throw new Error("User not authenticated");
    }

    const response = await api.get(`/appointments/pet/${petId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching appointments for pet ${petId}:`, error);
    throw error;
  }
};

// Cancel an appointment
const cancelAppointment = async (appointmentId) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await api.delete(`/appointments/${appointmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    throw error;
  }
};

// Fetch available veterinary services
const getVeterinaryServices = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await api.get(`/services`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching veterinary services:", error);
    throw error;
  }
};

// Fetch veterinarian information
const getVeterinarianInfo = async (veterinarianId) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await api.get(`/veterinarians/${veterinarianId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching veterinarian information:", error);
    throw error;
  }
};

// Book an appointment
const bookAppointment = async (appointmentData) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await api.post("/appointments/", appointmentData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error booking appointment:", error);
    throw error;
  }
};

const getAllAppointments = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await api.get("/appointments/all", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all appointments:", error);
    throw error;
  }
};

// Export all functions
export {
  // Rider Management
  getRiderData,
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
  getUserAddresses,

  // Directions
  getDirections,

  // Driver Management
  getDriverData,
  getStoredDriverData,
  updateDriverStatus,
  getPendingRides,
  getDriverTransactions,

  // PetTaxi Management
  getUserPetTaxiRides,
  createPetTaxiRide,
  fetchPetTaxiRideById,
  fetchDriverLocation,
  getCurrentLocationForDriver,
  updateDriverLocation,
  acceptRide,
  updateRideStatus,

  // Pet Management
  getRefillRequestStatus,
  getAvailableAppointmentSlots,
  bookAppointment,
  getAppointmentDetails,
  cancelAppointment,
  getVeterinaryServices,
  getVeterinarianInfo,
  getAppointmentsByPetId,
  getAllAppointments,
};
