import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTIFICATION_ID_KEY = "DRIVER_LOCATION_NOTIFICATION_ID";
const NOTIFICATION_ACTIVE_KEY = "DRIVER_LOCATION_NOTIFICATION_ACTIVE";
const DRIVER_ONLINE_STATUS_KEY = "DRIVER_ONLINE_STATUS";

export const DriverNotificationManager = {
  async requestLocationPermission() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      return false;
    }
    return true;
  },

  async updateLocation() {
    const hasPermission = await this.requestLocationPermission();
    if (!hasPermission) {
      console.log("Location permission not granted");
      return null;
    }
    try {
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      console.log("Current location:", location);
      return location;
    } catch (error) {
      console.error("Error getting current location:", error);
      return null;
    }
  },

  async setupNotification() {
    const isActive = await AsyncStorage.getItem(NOTIFICATION_ACTIVE_KEY);
    const isOnline = await AsyncStorage.getItem(DRIVER_ONLINE_STATUS_KEY);
    if (isActive === "true" || isOnline !== "true") {
      console.log(
        "Notification setup skipped: already active or driver offline"
      );
      return;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      console.log("Notification permissions not granted");
      return;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Location Update",
        body: "Tap to update your location",
      },
      trigger: {
        seconds: 600, // 10 minutes
        repeats: true,
      },
    });

    await AsyncStorage.setItem(NOTIFICATION_ID_KEY, notificationId);
    await AsyncStorage.setItem(NOTIFICATION_ACTIVE_KEY, "true");
    console.log("Notification scheduled with ID:", notificationId);
  },

  async cancelNotification() {
    const notificationId = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      await AsyncStorage.removeItem(NOTIFICATION_ID_KEY);
      await AsyncStorage.setItem(NOTIFICATION_ACTIVE_KEY, "false");
      console.log(`Notification cancelled: ${notificationId}`);
    }
  },

  async updateNotificationStatus(isOnline) {
    if (isOnline) {
      await this.setupNotification();
    } else {
      await this.cancelNotification();
    }
    await AsyncStorage.setItem(
      DRIVER_ONLINE_STATUS_KEY,
      isOnline ? "true" : "false"
    );
  },

  async isNotificationActive() {
    const isActive = await AsyncStorage.getItem(NOTIFICATION_ACTIVE_KEY);
    return isActive === "true";
  },
};

Notifications.addNotificationResponseReceivedListener(async (response) => {
  if (response.notification.request.content.data.action === "updateLocation") {
    const location = await DriverLocationNotificationManager.updateLocation();
    if (location) {
      console.log("Location updated from notification:", location);
      // Here you would typically send this location to your backend
      // For example: await sendLocationToBackend(location);
    }
  }
});
