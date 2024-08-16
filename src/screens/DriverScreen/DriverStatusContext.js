import React, { createContext, useState, useContext, useEffect } from "react";
import { DriverNotificationManager } from "./DriverNotificationManager";

const DriverStatusContext = createContext();

export const DriverStatusProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    DriverNotificationManager.updateNotificationStatus(isOnline);
  }, [isOnline]);

  return (
    <DriverStatusContext.Provider value={{ isOnline, setIsOnline }}>
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
