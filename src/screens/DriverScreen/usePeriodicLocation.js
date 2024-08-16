import { useState, useEffect, useCallback, useRef } from "react";
import * as Location from "expo-location";
import { LocationUtils } from "./Locationutils";

export function usePeriodicLocation(interval = null) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const timerRef = useRef(null);
  const lastUpdateTimeRef = useRef(0);

  const getLocation = useCallback(async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const currentTime = Date.now();
      if (LocationUtils.isSignificantChange(location)) {
        console.log(
          "Significant location change detected. Time since last update:",
          currentTime - lastUpdateTimeRef.current
        );
        lastUpdateTimeRef.current = currentTime;
        setLocation(location);
      }
    } catch (error) {
      console.error("Error getting location:", error);
      setErrorMsg("Failed to get location");
    }
  }, []);

  useEffect(() => {
    if (interval) {
      getLocation(); // Get initial location
      timerRef.current = setInterval(getLocation, interval);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [interval, getLocation]);

  return { location, errorMsg, refreshLocation: getLocation };
}
