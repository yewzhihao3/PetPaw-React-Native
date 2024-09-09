import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, WS_BASE_URL } from "../../config";

const GOOGLE_MAPS_API_KEY = "AIzaSyDMk6B-XVLm3y86H7HCNxiJCAR4kUsZ6pM";

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // Increase to 60 seconds
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
    console.log("Sending pet data:", petData);
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

    console.log("Pet creation response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating pet:", error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Error request:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error message:", error.message);
    }
    throw error;
  }
};

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

const getRefillRequestHistory = async (prescriptionId, token) => {
  try {
    const response = await api.get(
      `/prescriptions/refill/requests?prescription_id=${prescriptionId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching refill request history:", error);
    return [];
  }
};

const getPrescriptionsByPetId = async (petId, token) => {
  try {
    const response = await api.get(`/prescriptions/${petId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Add refill request history to each prescription
    const prescriptionsWithRefillHistory = await Promise.all(
      response.data.map(async (prescription) => {
        const refillRequests = await getRefillRequestHistory(
          prescription.id,
          token
        );
        return { ...prescription, refill_requests: refillRequests };
      })
    );
    return prescriptionsWithRefillHistory;
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    throw error;
  }
};

const createRefillRequest = async (prescriptionId, token) => {
  try {
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
    throw error;
  }
};

const getPetById = async (petId) => {
  try {
    const response = await axios.get(`${API_URL}/pets/${petId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching pet details:", error);
    throw error;
  }
};

const updatePetImage = async (petId, imageUri) => {
  try {
    // Get the file name and type from the URI
    const uriParts = imageUri.split(".");
    const fileType = uriParts[uriParts.length - 1];

    // Create a FormData object
    const formData = new FormData();
    formData.append("image", {
      uri: imageUri,
      name: `pet_image.${fileType}`,
      type: `image/${fileType}`,
    });

    console.log("Updating pet image for pet ID:", petId);
    console.log("Image URI:", imageUri);

    const token = await AsyncStorage.getItem("userToken");
    console.log("User token:", token);

    const response = await api.put(`/pets/${petId}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Image update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating pet image:", error);
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

const updatePet = async (petId, petData) => {
  try {
    console.log("Updating pet with ID:", petId);
    console.log("Pet data being sent:", JSON.stringify(petData, null, 2));

    const token = await AsyncStorage.getItem("userToken");
    console.log("Authorization token:", token);

    const response = await api.put(`/pets/${petId}`, petData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Pet update response:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("Error updating pet:", error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    }
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
