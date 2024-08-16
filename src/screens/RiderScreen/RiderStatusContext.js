import React, { createContext, useState, useContext, useEffect } from "react";
import { LocationNotificationManager } from "./LocationNotificationManager";

const RiderStatusContext = createContext();

export const RiderStatusProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    LocationNotificationManager.updateNotificationStatus(isOnline);
  }, [isOnline]);

  return (
    <RiderStatusContext.Provider value={{ isOnline, setIsOnline }}>
      {children}
    </RiderStatusContext.Provider>
  );
};

export const useRiderStatus = () => {
  const context = useContext(RiderStatusContext);
  if (context === undefined) {
    throw new Error("useRiderStatus must be used within a RiderStatusProvider");
  }
  return context;
};
