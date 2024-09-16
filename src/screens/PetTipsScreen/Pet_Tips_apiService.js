import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 seconds
});

export const getAllPetTips = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await api.get("/pet-tips/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching pet tips:", error);
    throw error;
  }
};

export const getPetTipById = async (tipId) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await api.get(`/pet-tips/${tipId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching pet tip with id ${tipId}:`, error);
    throw error;
  }
};

export const getPetTipsByCategory = async (category) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await api.get(`/pet-tips/category/${category}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching pet tips for category ${category}:`, error);
    throw error;
  }
};

export const createPetTip = async (petTipData) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const formData = new FormData();

    // Append text fields
    formData.append("title", petTipData.title);
    formData.append("category", petTipData.category);
    formData.append("description", petTipData.description);
    formData.append("video_url", petTipData.video_url);

    // Append steps
    formData.append("step1_title", petTipData.steps[0].title);
    formData.append("step1_content", petTipData.steps[0].content);
    formData.append("step2_title", petTipData.steps[1].title);
    formData.append("step2_content", petTipData.steps[1].content);
    formData.append("step3_title", petTipData.steps[2].title);
    formData.append("step3_content", petTipData.steps[2].content);
    formData.append("step4_title", petTipData.steps[3].title);
    formData.append("step4_content", petTipData.steps[3].content);

    // Append image
    if (petTipData.image) {
      const uriParts = petTipData.image.split(".");
      const fileType = uriParts[uriParts.length - 1];
      formData.append("image", {
        uri: petTipData.image,
        name: `pet_tip_image.${fileType}`,
        type: `image/${fileType}`,
      });
    }

    const response = await api.post("/pet-tips/", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating pet tip:", error);
    throw error;
  }
};

export const updatePetTip = async (tipId, petTipData) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const formData = new FormData();

    // Append text fields (only if they exist in petTipData)
    if (petTipData.title) formData.append("title", petTipData.title);
    if (petTipData.category) formData.append("category", petTipData.category);
    if (petTipData.description)
      formData.append("description", petTipData.description);
    if (petTipData.video_url)
      formData.append("video_url", petTipData.video_url);

    // Append steps (only if they exist in petTipData)
    if (petTipData.steps) {
      petTipData.steps.forEach((step, index) => {
        if (step.title) formData.append(`step${index + 1}_title`, step.title);
        if (step.content)
          formData.append(`step${index + 1}_content`, step.content);
      });
    }

    // Append image (only if it exists in petTipData)
    if (petTipData.image) {
      const uriParts = petTipData.image.split(".");
      const fileType = uriParts[uriParts.length - 1];
      formData.append("image", {
        uri: petTipData.image,
        name: `pet_tip_image.${fileType}`,
        type: `image/${fileType}`,
      });
    }

    const response = await api.put(`/pet-tips/${tipId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating pet tip with id ${tipId}:`, error);
    throw error;
  }
};

export const deletePetTip = async (tipId) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const response = await api.delete(`/pet-tips/${tipId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting pet tip with id ${tipId}:`, error);
    throw error;
  }
};
