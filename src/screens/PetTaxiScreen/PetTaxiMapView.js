// PetTaxiMapView.js
import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

const { width, height } = Dimensions.get("window");

const PetTaxiMapView = ({ ride, driverLocation }) => {
  const [region, setRegion] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  useEffect(() => {
    if (ride && ride.pickup_latitude && ride.pickup_longitude) {
      setRegion({
        latitude: ride.pickup_latitude,
        longitude: ride.pickup_longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [ride]);

  useEffect(() => {
    if (mapRef.current && ride && driverLocation) {
      const coordinates = [
        { latitude: ride.pickup_latitude, longitude: ride.pickup_longitude },
        { latitude: ride.dropoff_latitude, longitude: ride.dropoff_longitude },
        {
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
        },
      ];
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [ride, driverLocation]);

  if (!region) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={styles.map} initialRegion={region}>
        {ride && (
          <>
            <Marker
              coordinate={{
                latitude: ride.pickup_latitude,
                longitude: ride.pickup_longitude,
              }}
              title="Pickup"
              description={ride.pickup_location}
              pinColor="green"
            />
            <Marker
              coordinate={{
                latitude: ride.dropoff_latitude,
                longitude: ride.dropoff_longitude,
              }}
              title="Dropoff"
              description={ride.dropoff_location}
              pinColor="red"
            />
          </>
        )}
        {driverLocation && (
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
                source={require("../../../assets/PetTaxi//pet-taxi-icon.png")}
                style={styles.driverIcon}
              />
            </View>
          </Marker>
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  driverMarker: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 5,
  },
  driverIcon: {
    width: 30,
    height: 30,
  },
});

export default PetTaxiMapView;
