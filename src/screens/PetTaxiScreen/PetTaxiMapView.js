import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchPetTaxiRideById,
  getDriverData,
  fetchDriverLocation,
  getDirections,
} from "../../screens/API/apiService";

const { width, height } = Dimensions.get("window");

const calculateTimeActive = (createdAt) => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffInMonths =
    (now.getFullYear() - createdDate.getFullYear()) * 12 +
    (now.getMonth() - createdDate.getMonth());

  if (diffInMonths < 1) {
    return "Less than a month";
  } else if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""}`;
  } else {
    const years = Math.floor(diffInMonths / 12);
    return `${years} year${years > 1 ? "s" : ""}`;
  }
};

const RideStatusInfo = ({ ride, driver }) => {
  return (
    <View style={styles.rideInfoContainer}>
      {(ride.status === "ACCEPTED" || ride.status === "IN_PROGRESS") &&
      driver ? (
        <View style={styles.driverCard}>
          <View style={styles.driverImageContainer}>
            {driver.image_url ? (
              <Image
                source={{ uri: driver.image_url }}
                style={styles.driverImage}
              />
            ) : (
              <Ionicons name="person" size={40} color="#FFFFFF" />
            )}
          </View>
          <View style={styles.driverTextInfo}>
            <Text style={styles.driverCardTitle}>{driver.name}</Text>
            <Text style={styles.driverCardSubtitle}>Driver is on the way!</Text>
            <View style={styles.driverBadge}>
              <Text style={styles.driverBadgeText}>{driver.license_plate}</Text>
            </View>
          </View>
        </View>
      ) : (
        <Text style={styles.statusMessage}>
          {ride.status === "PENDING"
            ? "Waiting for driver to accept..."
            : ride.status === "COMPLETED"
            ? "Ride completed"
            : ride.status === "CANCELLED"
            ? "This ride has been cancelled"
            : ""}
        </Text>
      )}
    </View>
  );
};

const PetTaxiMapView = ({ route }) => {
  const { rideId } = route.params || {};
  const [ride, setRide] = useState(null);
  const [driver, setDriver] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const mapRef = useRef(null);
  const navigation = useNavigation();

  const fetchRideData = useCallback(async () => {
    if (!rideId) {
      setError("No ride ID provided");
      return;
    }
    try {
      setIsRefreshing(true);
      setError(null);
      const token = await AsyncStorage.getItem("userToken");
      const updatedRide = await fetchPetTaxiRideById(rideId, token);

      if (updatedRide && typeof updatedRide === "object") {
        setRide(updatedRide);
        setRegion({
          latitude: updatedRide.pickup_latitude,
          longitude: updatedRide.pickup_longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });

        if (
          updatedRide.status === "ACCEPTED" ||
          updatedRide.status === "IN_PROGRESS"
        ) {
          const driverData = await getDriverData(updatedRide.driver_id, token);
          setDriver(driverData);
          const location = await fetchDriverLocation(
            updatedRide.driver_id,
            token
          );
          setDriverLocation(location);

          // Fetch route
          const directions = await getDirections(
            location.latitude,
            location.longitude,
            updatedRide.status === "ACCEPTED"
              ? updatedRide.pickup_latitude
              : updatedRide.dropoff_latitude,
            updatedRide.status === "ACCEPTED"
              ? updatedRide.pickup_longitude
              : updatedRide.dropoff_longitude
          );
          if (directions.routes && directions.routes.length > 0) {
            const points = decodePolyline(
              directions.routes[0].overview_polyline.points
            );
            setRouteCoordinates(points);
          }
        }
      } else {
        throw new Error("Invalid ride data received");
      }
    } catch (error) {
      console.error("Error fetching ride data:", error);
      setError("Failed to fetch ride data. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  }, [rideId]);

  useEffect(() => {
    fetchRideData();
    const interval = setInterval(fetchRideData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [fetchRideData]);

  const handleRefresh = () => {
    fetchRideData();
  };

  const decodePolyline = (encoded) => {
    if (!encoded) {
      return [];
    }
    const poly = [];
    let index = 0,
      lat = 0,
      lng = 0;
    while (index < encoded.length) {
      let shift = 0,
        result = 0;
      let byte;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;
      poly.push({
        latitude: lat * 1e-5,
        longitude: lng * 1e-5,
      });
    }
    return poly;
  };

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!region || !ride) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#5B21B6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={styles.map} initialRegion={region}>
        <Marker
          coordinate={{
            latitude: ride.pickup_latitude,
            longitude: ride.pickup_longitude,
          }}
          title="Pickup Location"
          description={ride.pickup_location}
          pinColor="green"
        />
        <Marker
          coordinate={{
            latitude: ride.dropoff_latitude,
            longitude: ride.dropoff_longitude,
          }}
          title="Dropoff Location"
          description={ride.dropoff_location}
          pinColor="red"
        />
        {driverLocation && (
          <Marker
            coordinate={driverLocation}
            title="Driver Location"
            description="Current driver location"
          >
            <Image
              source={require("../../../assets/PetTaxi/car_icon.png")}
              style={styles.driverMarker}
            />
          </Marker>
        )}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#5B21B6"
            strokeWidth={3}
          />
        )}
      </MapView>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handleRefresh}
        disabled={isRefreshing}
      >
        <Ionicons name="refresh" size={24} color="white" />
      </TouchableOpacity>
      <RideStatusInfo ride={ride} driver={driver} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "#5B21B6",
    padding: 10,
    borderRadius: 30,
    zIndex: 2,
  },
  refreshButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#5B21B6",
    padding: 10,
    borderRadius: 30,
    zIndex: 2,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#5B21B6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
  },
  rideInfoContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  driverCard: {
    backgroundColor: "#6A0DAD",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  driverImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 25,
    backgroundColor: "#8A2BE2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  driverImage: {
    width: 100,
    height: 100,
    borderRadius: 25,
  },
  driverTextInfo: {
    flex: 1,
  },
  driverCardTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  driverCardSubtitle: {
    fontSize: 18,
    color: "#E6E6FA",
    marginTop: 2,
  },
  driverBadge: {
    backgroundColor: "#9370DB",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 5,
  },
  driverBadgeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
  },
  statusMessage: {
    fontSize: 16,
    color: "#6D28D9",
    textAlign: "center",
    padding: 15,
    fontWeight: "bold",
  },
  driverMarker: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
});

export default PetTaxiMapView;
