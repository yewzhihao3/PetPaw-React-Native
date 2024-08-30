import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import {
  fetchPetTaxiRideById,
  getDriverData,
} from "../../screens/API/apiService";

const { width, height } = Dimensions.get("window");

const PetTaxiMapView = ({ route }) => {
  const { rideId } = route.params || {};
  const [ride, setRide] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const navigation = useNavigation();

  const fetchRideData = useCallback(async () => {
    if (!rideId) {
      console.error("No rideId provided");
      setError("No ride ID provided");
      return;
    }
    try {
      setIsRefreshing(true);
      setError(null);
      const token = await AsyncStorage.getItem("userToken");
      const updatedRide = await fetchPetTaxiRideById(rideId, token);
      console.log("Fetched ride data:", JSON.stringify(updatedRide, null, 2));

      if (updatedRide && typeof updatedRide === "object") {
        setRide(updatedRide);

        if (
          updatedRide.status === "ACCEPTED" ||
          updatedRide.status === "IN_PROGRESS"
        ) {
          if (updatedRide.driver_id) {
            const driverData = await getDriverData(
              updatedRide.driver_id,
              token
            );
            setDriverInfo(driverData);
            if (
              driverData &&
              driverData.last_latitude &&
              driverData.last_longitude
            ) {
              setDriverLocation({
                latitude: parseFloat(driverData.last_latitude),
                longitude: parseFloat(driverData.last_longitude),
              });
            } else {
              setDriverLocation(null);
            }
          } else {
            setDriverLocation(null);
          }
        } else {
          setDriverLocation(null);
        }

        if (updatedRide.pickup_latitude && updatedRide.pickup_longitude) {
          const newRegion = {
            latitude: updatedRide.pickup_latitude,
            longitude: updatedRide.pickup_longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          };
          setRegion(newRegion);
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
    const intervalId = setInterval(fetchRideData, 120000);
    return () => clearInterval(intervalId);
  }, [fetchRideData]);

  useEffect(() => {
    if (mapRef.current && ride && region) {
      const coordinates = [
        { latitude: ride.pickup_latitude, longitude: ride.pickup_longitude },
        { latitude: ride.dropoff_latitude, longitude: ride.dropoff_longitude },
      ];
      if (driverLocation) {
        coordinates.push(driverLocation);
      }
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [ride, driverLocation, region]);

  const handleRefresh = () => {
    fetchRideData();
  };

  const handleCallDriver = () => {
    if (driverInfo?.phone_number) {
      Linking.openURL(`tel:${driverInfo.phone_number}`);
    } else {
      console.log("Driver phone number not available");
    }
  };

  const renderDriverMarker = () => {
    if (
      !driverLocation ||
      !driverLocation.latitude ||
      !driverLocation.longitude
    ) {
      console.log("Driver location is not available");
      return null;
    }

    return (
      <Marker
        coordinate={{
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
        }}
        title="Driver"
        description="Driver's current location"
      >
        <View style={styles.driverMarker}>
          <Image
            source={require("../../../assets/PetTaxi/pet-taxi-icon.png")}
            style={styles.driverIcon}
          />
        </View>
      </Marker>
    );
  };

  const renderRoutePolyline = () => {
    if (!driverLocation || !ride) {
      return null;
    }

    let coordinates = [];

    if (
      ride.status === "ACCEPTED" &&
      ride.pickup_latitude &&
      ride.pickup_longitude
    ) {
      coordinates = [
        {
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
        },
        {
          latitude: ride.pickup_latitude,
          longitude: ride.pickup_longitude,
        },
      ];
    } else if (
      ride.status === "IN_PROGRESS" &&
      ride.dropoff_latitude &&
      ride.dropoff_longitude
    ) {
      coordinates = [
        {
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
        },
        {
          latitude: ride.dropoff_latitude,
          longitude: ride.dropoff_longitude,
        },
      ];
    }

    if (coordinates.length !== 2) {
      return null;
    }

    return (
      <Polyline
        coordinates={coordinates}
        strokeWidth={4}
        strokeColor="#5B21B6"
      />
    );
  };

  if (error) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!region || !ride) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#5B21B6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        provider={Platform.OS === "android" ? "google" : null}
      >
        {ride.pickup_latitude && ride.pickup_longitude && (
          <Marker
            coordinate={{
              latitude: ride.pickup_latitude,
              longitude: ride.pickup_longitude,
            }}
            title="Pickup"
            description={ride.pickup_location}
            pinColor="green"
          />
        )}
        {ride.dropoff_latitude && ride.dropoff_longitude && (
          <Marker
            coordinate={{
              latitude: ride.dropoff_latitude,
              longitude: ride.dropoff_longitude,
            }}
            title="Dropoff"
            description={ride.dropoff_location}
            pinColor="red"
          />
        )}
        {renderDriverMarker()}
        {renderRoutePolyline()}
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
      {ride.status === "PENDING" ? (
        <View style={styles.pendingContainer}>
          <Text style={styles.pendingText}>Waiting for a driver...</Text>
        </View>
      ) : (ride.status === "ACCEPTED" || ride.status === "IN_PROGRESS") &&
        driverInfo ? (
        <View style={styles.driverInfoContainer}>
          <Image
            source={{
              uri: driverInfo.image_url || "https://via.placeholder.com/60",
            }}
            style={styles.driverImage}
          />
          <View style={styles.driverTextInfo}>
            <Text style={styles.driverName}>
              {driverInfo.name || "Driver Name"}
            </Text>
            <Text style={styles.driverPlate}>
              License Plate: {driverInfo.license_plate || "N/A"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.callButton}
            onPress={handleCallDriver}
          >
            <Ionicons name="call" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{ride.status}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
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
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 18,
    marginBottom: 10,
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
  pendingContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    padding: 10,
    backgroundColor: "#FBBF24",
  },
  pendingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  driverInfoContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  driverImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  driverTextInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  driverPlate: {
    fontSize: 14,
    color: "#6B7280",
  },
  callButton: {
    backgroundColor: "#5B21B6",
    padding: 10,
    borderRadius: 30,
  },
  statusContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    padding: 10,
    backgroundColor: "#E5E7EB",
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  driverMarker: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5B21B6",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "white",
  },
  driverIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
});

export default PetTaxiMapView;
