// TamagotchiApiService.js
import axios from "axios";
import { API_URL } from "../../config";

const API_BASE_URL = `${API_URL}/pet_tamagotchi`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const handleApiError = (error, customMessage) => {
  console.error(`${customMessage}:`, error);
  if (error.response) {
    console.error("Response data:", error.response.data);
    console.error("Response status:", error.response.status);
    console.error("Response headers:", error.response.headers);
  } else if (error.request) {
    console.error("No response received:", error.request);
  } else {
    console.error("Error setting up request:", error.message);
  }
  throw error;
};

const TamagotchiApiService = {
  createVirtualPet: async (petData) => {
    try {
      const response = await apiClient.post("/virtual_pets/", petData);
      return response.data;
    } catch (error) {
      handleApiError(error, "Error creating virtual pet");
    }
  },

  getVirtualPet: async (petId) => {
    try {
      const response = await apiClient.get(`/virtual_pets/${petId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, "Error fetching virtual pet");
    }
  },

  getUserVirtualPets: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}/virtual_pets/`);
      return response.data;
    } catch (error) {
      handleApiError(error, "Error fetching user virtual pets");
    }
  },

  updateVirtualPet: async (petId, updateData) => {
    try {
      const response = await apiClient.put(
        `/virtual_pets/${petId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      handleApiError(error, "Error updating virtual pet");
    }
  },

  deleteVirtualPet: async (petId) => {
    try {
      const response = await apiClient.delete(`/virtual_pets/${petId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, "Error deleting virtual pet");
    }
  },

  addTrophy: async (petId, trophyData) => {
    try {
      const response = await apiClient.post(
        `/virtual_pets/${petId}/trophies/`,
        trophyData
      );
      return response.data;
    } catch (error) {
      handleApiError(error, "Error adding trophy");
    }
  },

  getVirtualPetTrophies: async (petId) => {
    try {
      const response = await apiClient.get(`/virtual_pets/${petId}/trophies/`);
      return response.data;
    } catch (error) {
      handleApiError(error, "Error fetching virtual pet trophies");
    }
  },

  syncVirtualPetState: async (petId, petState) => {
    try {
      const response = await apiClient.put(`/virtual_pets/${petId}`, petState);
      return response.data;
    } catch (error) {
      handleApiError(error, "Error syncing virtual pet state");
    }
  },

  updateTotalSteps: async (petId, data) => {
    try {
      const response = await apiClient.post(
        `/virtual_pets/${petId}/update_steps`,
        { steps: data.steps }
      );
      return response.data;
    } catch (error) {
      handleApiError(error, "Error updating total steps");
    }
  },

  getTotalSteps: async (petId) => {
    try {
      const response = await apiClient.get(
        `/virtual_pets/${petId}/total_steps`
      );
      return response.data.total_steps;
    } catch (error) {
      handleApiError(error, "Error fetching total steps");
    }
  },

  checkAndUnlockTrophies: async (petId, data) => {
    try {
      const response = await apiClient.post(
        `/virtual_pets/${petId}/check-trophies`,
        data
      );
      return response.data;
    } catch (error) {
      handleApiError(error, "Error checking and unlocking trophies");
    }
  },
};

export default TamagotchiApiService;
