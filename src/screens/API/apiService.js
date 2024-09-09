import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, WS_BASE_URL } from "../../config";

const GOOGLE_MAPS_API_KEY = "AIzaSyDMk6B-XVLm3y86H7HCNxiJCAR4kUsZ6pM";

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // Increase to 60 seconds
});

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

export {
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
