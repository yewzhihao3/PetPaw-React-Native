import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DriverStatusContext = createContext();

export const DriverStatusProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const loadOnlineStatus = async () => {
      try {
        const storedStatus = await AsyncStorage.getItem("driverOnlineStatus");
        setIsOnline(storedStatus === "true");
      } catch (error) {
        console.error("Error loading online status:", error);
      }
    };
    loadOnlineStatus();
  }, []);

  const updateOnlineStatus = async (status) => {
    try {
      await AsyncStorage.setItem("driverOnlineStatus", status.toString());
      setIsOnline(status);
    } catch (error) {
      console.error("Error saving online status:", error);
    }
  };

  return (
    <DriverStatusContext.Provider
      value={{ isOnline, setIsOnline: updateOnlineStatus }}
    >
      {children}
    </DriverStatusContext.Provider>
  );
};

export const useDriverStatus = () => {
  const context = useContext(DriverStatusContext);
  if (context === undefined) {
    throw new Error(
      "useDriverStatus must be used within a DriverStatusProvider"
    );
  }
  return context;
};
