import React, { createContext, useContext, useEffect, useState } from "react";
import * as Location from "expo-location";
import { getStoredRiderData, updateRiderLocation } from "./RiderapiService";
import { usePeriodicLocation } from "./usePeriodicLocation";
import { useRiderStatus } from "./RiderStatusContext";

const RiderLocationContext = createContext();

export const RiderLocationProvider = ({ children }) => {
  const [riderId, setRiderId] = useState(null);
  const [token, setToken] = useState(null);
  const { isOnline } = useRiderStatus();

  useEffect(() => {
    const loadRiderData = async () => {
      try {
        const { token: storedToken, riderId: storedRiderId } =
          await getStoredRiderData();
        setToken(storedToken);
        setRiderId(storedRiderId);
      } catch (error) {
        console.error("Error loading rider data:", error);
      }
    };
    loadRiderData();

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
      if (newLocation && riderId && token) {
        await updateRiderLocation(
          riderId,
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
    <RiderLocationContext.Provider
      value={{
        location,
        errorMsg,
        refreshLocation,
        riderId,
        token,
        manualLocationUpdate,
      }}
    >
      {children}
    </RiderLocationContext.Provider>
  );
};

export const useRiderLocation = () => {
  const context = useContext(RiderLocationContext);
  if (context === undefined) {
    throw new Error(
      "useRiderLocation must be used within a RiderLocationProvider"
    );
  }
  return context;
};
