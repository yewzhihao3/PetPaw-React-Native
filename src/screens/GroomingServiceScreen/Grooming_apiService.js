// src/services/Grooming_apiService.js

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 seconds
});

const Grooming_apiService = {
  getGroomingServices: async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await api.get("/pet-grooming/services", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetched grooming services:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching grooming services:", error);
      throw error;
    }
  },

  getBookingHistory: async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const userId = await AsyncStorage.getItem("userId");
      const response = await api.get(
        `/pet-grooming/booking-history/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Fetch pet details for each booking
      const bookingsWithPetNames = await Promise.all(
        response.data.map(async (booking) => {
          const petResponse = await api.get(`/pets/${booking.pet_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          return { ...booking, pet_name: petResponse.data.name };
        })
      );

      console.log("Fetched booking history:", bookingsWithPetNames);
      return bookingsWithPetNames;
    } catch (error) {
      console.error("Error fetching booking history:", error);
      throw error;
    }
  },

  getUserPets: async () => {
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

      console.log("Fetched user pets:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching user's pets:", error);
      throw error;
    }
  },

  getAvailableTimeSlots: async (date) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await api.get(`/pet-grooming/available-slots`, {
        params: { date },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Transform the data to match our expected format
      const transformedSlots = response.data.map((slot) => ({
        startTime: slot.start_time,
      }));
      console.log("Fetched available time slots:", transformedSlots);
      return transformedSlots;
    } catch (error) {
      console.error("Error fetching available time slots:", error);
      throw error;
    }
  },
  createBooking: async (bookingData) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const formData = new FormData();

      Object.keys(bookingData).forEach((key) => {
        if (key === "service_ids") {
          formData.append(key, bookingData[key].join(","));
        } else {
          formData.append(key, bookingData[key]);
        }
      });

      const response = await api.post("/pet-grooming/bookings", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Booking created:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Error creating booking:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

export default Grooming_apiService;
