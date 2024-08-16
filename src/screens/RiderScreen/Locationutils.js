export const LocationUtils = {
  lastLocation: null,

  isSignificantChange(newLocation, threshold = 10) {
    // threshold in meters
    if (!this.lastLocation) {
      this.lastLocation = newLocation;
      return true;
    }

    const distance = this.calculateDistance(
      this.lastLocation.coords.latitude,
      this.lastLocation.coords.longitude,
      newLocation.coords.latitude,
      newLocation.coords.longitude
    );

    if (distance > threshold) {
      this.lastLocation = newLocation;
      return true;
    }

    return false;
  },

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  },
};
