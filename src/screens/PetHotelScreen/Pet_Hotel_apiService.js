// src/services/Pet_Hotel_apiService.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";

const PET_HOTELS_URL = `${API_URL}/pet-hotels`;

export const getPetHotels = async () => {
  try {
    const response = await axios.get(`${PET_HOTELS_URL}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching pet hotels:", error);
    throw error;
  }
};

export const createBooking = async (bookingData) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      throw new Error("User not authenticated");
    }
    console.log("Sending booking data:", bookingData);
    const response = await axios.post(
      `${PET_HOTELS_URL}/bookings`,
      bookingData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Booking creation response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating booking:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const getUserBookings = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const userId = await AsyncStorage.getItem("userId");
    if (!token || !userId) {
      throw new Error("User not authenticated");
    }
    console.log(`Fetching bookings for user ${userId}`);
    const response = await axios.get(`${PET_HOTELS_URL}/bookings`, {
      params: { user_id: userId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`Received bookings:`, response.data);
    // Fetch hotel details for each booking
    const bookingsWithHotels = await Promise.all(
      response.data.map(async (booking) => {
        try {
          console.log(`Fetching details for hotel ${booking.hotel_id}`);
          const hotelResponse = await axios.get(
            `${PET_HOTELS_URL}/${booking.hotel_id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          return { ...booking, hotel: hotelResponse.data };
        } catch (error) {
          console.error(
            `Error fetching hotel details for booking ${booking.id}:`,
            error.response ? error.response.data : error.message
          );
          return {
            ...booking,
            hotel: { id: booking.hotel_id, name: `Hotel ${booking.hotel_id}` },
          };
        }
      })
    );
    return bookingsWithHotels;
  } catch (error) {
    console.error(
      "Error fetching user bookings:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const updateBooking = async (bookingId, updateData) => {
  try {
    const response = await axios.put(
      `${PET_HOTELS_URL}/bookings/${bookingId}`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating booking:", error);
    throw error;
  }
};

export const deleteBooking = async (bookingId) => {
  try {
    await axios.delete(`${PET_HOTELS_URL}/bookings/${bookingId}`);
  } catch (error) {
    console.error("Error deleting booking:", error);
    throw error;
  }
};
