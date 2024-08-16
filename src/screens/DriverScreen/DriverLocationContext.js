import React, { createContext, useContext, useEffect, useState } from "react";
import * as Location from "expo-location";
import { getStoredDriverData, updateDriverLocation } from "../API/apiService";
import { usePeriodicLocation } from "./usePeriodicLocation";
import { useDriverStatus } from "./DriverStatusContext";

const DriverLocationContext = createContext();

export const DriverLocationProvider = ({ children }) => {
  const [driverId, setDriverId] = useState(null);
  const [token, setToken] = useState(null);
  const { isOnline } = useDriverStatus();

  useEffect(() => {
    const loadDriverData = async () => {
      try {
        const { token: storedToken, driverId: storedDriverId } =
          await getStoredDriverData();
        setToken(storedToken);
        setDriverId(storedDriverId);
      } catch (error) {
        console.error("Error loading driver data:", error);
      }
    };
    loadDriverData();

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
      }
    })();
  }, []);

  const TWO_MINUTES = 120000;
  const { location, errorMsg, refreshLocation } = usePeriodicLocation(
    isOnline ? TWO_MINUTES : null
  );

  const manualLocationUpdate = async () => {
    try {
      const newLocation = await refreshLocation();
      if (newLocation && driverId && token) {
        await updateDriverLocation(
          driverId,
          newLocation.coords.latitude,
          newLocation.coords.longitude,
          token
        );
        console.log("Manually updated location:", newLocation);
        return newLocation;
      }
    } catch (error) {
      console.error("Error updating location manually:", error);
      throw error;
    }
  };

  return (
    <DriverLocationContext.Provider
      value={{
        location,
        errorMsg,
        refreshLocation,
        driverId,
        token,
        manualLocationUpdate,
      }}
    >
      {children}
    </DriverLocationContext.Provider>
  );
};

export const useDriverLocation = () => {
  const context = useContext(DriverLocationContext);
  if (context === undefined) {
    throw new Error(
      "useDriverLocation must be used within a DriverLocationProvider"
    );
  }
  return context;
};
