import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, WS_BASE_URL } from "../../config";

const GOOGLE_MAPS_API_KEY = "AIzaSyDMk6B-XVLm3y86H7HCNxiJCAR4kUsZ6pM";

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 seconds
});

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

const createPet = async (petData) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const userId = await AsyncStorage.getItem("userId");
    if (!token || !userId) {
      throw new Error("User not authenticated");
    }

    petData.append("owner_id", userId);

    const response = await api.post("/pets/", petData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error creating pet:", error);
    throw error;
  }
};

const getVeterinarianById = async (veterinarianId, token) => {
  try {
    const response = await api.get(`/veterinarians/${veterinarianId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching veterinarian (ID: ${veterinarianId}):`,
      error
    );
    return null; // Return null if veterinarian data can't be fetched
  }
};

const getMedicalRecordsByPetId = async (petId) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await api.get(`/pets/${petId}/medical-records`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const medicalRecordsWithVeterinarian = await Promise.all(
      response.data.map(async (record) => {
        const veterinarian = await getVeterinarianById(
          record.veterinarian_id,
          token
        );
        return { ...record, veterinarian: veterinarian || { name: "N/A" } };
      })
    );

    return medicalRecordsWithVeterinarian;
  } catch (error) {
    console.error("Error fetching medical records:", error);
    throw error;
  }
};

const getRefillRequestHistory = async (prescriptionId, token) => {
  try {
    const response = await api.get(
      `/prescriptions/${prescriptionId}/refill-requests`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log(
        `No refill requests found for prescription ${prescriptionId}`
      );
      return []; // Return an empty array if no refill requests are found
    }
    console.error(
      `Error fetching refill request history for prescription ${prescriptionId}:`,
      error
    );
    return []; // Return an empty array for any other error
  }
};

const getPrescriptionsByPetId = async (petId, token) => {
  try {
    const response = await api.get(`/prescriptions/${petId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const prescriptionsWithDetails = await Promise.all(
      response.data.map(async (prescription) => {
        try {
          const refillRequests = await getRefillRequestHistory(
            prescription.id,
            token
          );
          const veterinarian = await getVeterinarianById(
            prescription.veterinarian_id,
            token
          );
          return {
            ...prescription,
            refill_requests: refillRequests,
            veterinarian: veterinarian || { name: "N/A" },
          };
        } catch (error) {
          console.error(
            `Error fetching details for prescription ${prescription.id}:`,
            error
          );
          return {
            ...prescription,
            refill_requests: [],
            veterinarian: { name: "N/A" },
          };
        }
      })
    );
    return prescriptionsWithDetails;
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    throw error;
  }
};

const createRefillRequest = async (prescriptionId) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await api.post(
      "/prescriptions/refill/request",
      { prescription_id: prescriptionId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating refill request:", error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
    }
    throw error;
  }
};

const getPetById = async (petId) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await api.get(`/pets/${petId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching pet details:", error);
    throw error;
  }
};

const updatePetImage = async (petId, imageUri) => {
  try {
    const uriParts = imageUri.split(".");
    const fileType = uriParts[uriParts.length - 1];

    const formData = new FormData();
    formData.append("image", {
      uri: imageUri,
      name: `pet_image.${fileType}`,
      type: `image/${fileType}`,
    });

    const token = await AsyncStorage.getItem("userToken");
    const response = await api.put(`/pets/${petId}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error updating pet image:", error);
    throw error;
  }
};

const updatePet = async (petId, petData) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await api.put(`/pets/${petId}`, petData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating pet:", error);
    throw error;
  }
};

export {
  getUserPets,
  createPet,
  getMedicalRecordsByPetId,
  getPrescriptionsByPetId,
  createRefillRequest,
  getPetById,
  updatePetImage,
  updatePet,
};
