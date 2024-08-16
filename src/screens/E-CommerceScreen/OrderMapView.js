import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Icon from "react-native-feather";
import { getDirections } from "../API/apiService";

const { width, height } = Dimensions.get("window");

const OrderMapView = ({ order, riderLocation, onClose }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    console.log("Order in OrderMapView:", order);
    console.log("Rider location in OrderMapView:", riderLocation);
    if (order?.delivery_address) {
      const { latitude, longitude } = order.delivery_address;
      if (latitude && longitude && latitude !== 0 && longitude !== 0) {
        setUserLocation({ latitude, longitude });
      } else {
        console.error("Invalid delivery address coordinates");
      }
    } else {
      console.error("delivery_address missing in order object");
    }
  }, [order, riderLocation]);

  useEffect(() => {
    if (userLocation && riderLocation) {
      fetchRoute();
    }
  }, [userLocation, riderLocation]);

  const fetchRoute = async () => {
    if (!riderLocation || !userLocation) return;
    try {
      const result = await getDirections(
        riderLocation.latitude,
        riderLocation.longitude,
        userLocation.latitude,
        userLocation.longitude
      );
      if (
        result.routes &&
        result.routes.length > 0 &&
        result.routes[0].overview_polyline
      ) {
        const points = decodePolyline(
          result.routes[0].overview_polyline.points
        );
        setRoute(points);
        fitMapToCoordinates([riderLocation, userLocation, ...points]);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const decodePolyline = (encoded) => {
    if (!encoded) {
      console.error("No encoded polyline provided");
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

  const fitMapToCoordinates = (coordinates) => {
    if (mapRef.current && coordinates.length > 0) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  console.log(
    "Rendering OrderMapView. User location:",
    userLocation,
    "Rider location:",
    riderLocation
  );

  if (!userLocation) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading map... Please wait.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={userLocation}
          title="Delivery Location"
          description={order.delivery_address.address_line1}
        >
          <Icon.MapPin stroke="#5B21B6" fill="#FFFFFF" width={30} height={30} />
        </Marker>

        {riderLocation && (
          <Marker
            coordinate={riderLocation}
            title="Rider's Location"
            description="Your order is on its way"
          >
            <Image
              source={require("../../../assets/E-Commerce/bike2.gif")}
              style={styles.markerImage}
              resizeMode="contain"
            />
          </Marker>
        )}

        {route && (
          <Polyline coordinates={route} strokeColor="#6d28d9" strokeWidth={3} />
        )}
      </MapView>

      {!riderLocation && (
        <View style={styles.noLocationMessage}>
          <Text style={styles.noLocationText}>
            Rider's location is not available yet. Please wait...
          </Text>
        </View>
      )}

      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon.X stroke="white" strokeWidth={2} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    width: width,
    height: height,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#5E17EB",
    borderRadius: 20,
    padding: 10,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  markerImage: {
    width: 40,
    height: 40,
  },
  defaultLocationMessage: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 5,
  },
  defaultLocationText: {
    color: "white",
    textAlign: "center",
  },
  defaultLocationMessage: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 5,
  },
  defaultLocationText: {
    color: "white",
    textAlign: "center",
  },
  noLocationMessage: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 5,
  },
  noLocationText: {
    color: "white",
    textAlign: "center",
  },
});

export default OrderMapView;
