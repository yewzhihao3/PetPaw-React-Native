import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, WS_BASE_URL } from "../../config";

const GOOGLE_MAPS_API_KEY = "AIzaSyDMk6B-XVLm3y86H7HCNxiJCAR4kUsZ6pM";

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // Increase to 60 seconds
});

const getMedicalRecordsByPetId = async (petId) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await axios.get(
      `${API_URL}/pets/${petId}/medical-records`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching medical records:", error);
    throw error;
  }
};

const getUserPets = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const userId = await AsyncStorage.getItem("userId");
    if (!token || !userId) {
      throw new Error("User not authenticated");
    }

    const response = await api.get(`/pets/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching user's pets:", error);
    throw error;
  }
};

const getServices = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await api.get("/appointments/services", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};

const createAppointment = async (appointmentData) => {
  try {
    const userToken = await AsyncStorage.getItem("userToken");
    const userId = await AsyncStorage.getItem("userId");

    if (!userToken || !userId) {
      throw new Error("User not authenticated");
    }

    const completeAppointmentData = {
      ...appointmentData,
      user_id: parseInt(userId),
    };

    console.log(
      "Sending appointment data to server:",
      JSON.stringify(completeAppointmentData, null, 2)
    );

    const response = await api.post(
      "/appointments/appointments",
      completeAppointmentData,
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );

    console.log("Appointment created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in createAppointment:");
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    throw error;
  }
};

const getUserPetsMedicalRecords = async () => {
  try {
    const pets = await getUserPets();
    const medicalRecordsPromises = pets.map(async (pet) => {
      const records = await getMedicalRecordsByPetId(pet.id);
      return records.map((record) => ({ ...record, pet_name: pet.name }));
    });
    const medicalRecordsArrays = await Promise.all(medicalRecordsPromises);
    const allMedicalRecords = medicalRecordsArrays.flat();

    // Sort medical records by expiration date
    return allMedicalRecords.sort(
      (a, b) => new Date(a.expiration_date) - new Date(b.expiration_date)
    );
  } catch (error) {
    console.error("Error fetching user pets medical records:", error);
    throw error;
  }
};

// Fetch user's upcoming appointments
const getUserAppointments = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const userId = await AsyncStorage.getItem("userId");

    if (!token || !userId) {
      throw new Error("User not authenticated");
    }

    const response = await api.get(`/appointments/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    throw error;
  }
};

const getBookedAppointments = async (date) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const formattedDate = date.split("T")[0]; // Ensure we're only sending the date part
    const response = await api.get(
      `/appointments/booked?date=${formattedDate}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching booked appointments:", error);
    throw error;
  }
};

const getUpcomingMedicalRecordExpirations = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      throw new Error("User not authenticated");
    }

    const pets = await getUserPets();
    const medicalRecordsPromises = pets.map(async (pet) => {
      const records = await getMedicalRecordsByPetId(pet.id);
      return records.map((record) => ({
        ...record,
        pet_name: pet.name,
        pet_id: pet.id,
      }));
    });

    const allMedicalRecords = (
      await Promise.all(medicalRecordsPromises)
    ).flat();

    const currentDate = new Date();
    const thirtyDaysFromNow = new Date(currentDate);
    thirtyDaysFromNow.setDate(currentDate.getDate() + 30);

    const upcomingExpirations = allMedicalRecords
      .filter((record) => {
        const expDate = new Date(record.expiration_date);
        return expDate <= thirtyDaysFromNow;
      })
      .sort(
        (a, b) => new Date(a.expiration_date) - new Date(b.expiration_date)
      );

    return upcomingExpirations.slice(0, 5); // Return top 5 upcoming expirations
  } catch (error) {
    console.error("Error fetching upcoming medical record expirations:", error);
    throw error;
  }
};

export {
  getUserPets,
  getServices,
  createAppointment,
  getUserAppointments,
  getBookedAppointments,
  getUpcomingMedicalRecordExpirations,
  getUserPetsMedicalRecords,
  getMedicalRecordsByPetId,
};
