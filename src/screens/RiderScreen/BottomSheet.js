import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  Dimensions,
  StyleSheet,
  Alert,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Modal from "react-native-modal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRiderLocation } from "./RiderLocationContext";
import { LocationNotificationManager } from "./LocationNotificationManager";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const NoOrder = ({ fadeAnim, onRefresh }) => (
  <Animated.View style={[styles.noOrdersContainer, { opacity: fadeAnim }]}>
    <Icon name="package-variant" size={100} color="#5E17EB" />
    <Text style={styles.noOrdersText}>No active orders at the moment</Text>
    <Text style={styles.noOrdersSubText}>
      New orders will appear here when they're ready for delivery
    </Text>
    <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
      <Text style={styles.refreshButtonText}>Refresh</Text>
    </TouchableOpacity>
  </Animated.View>
);

const BottomSheet = ({
  isVisible,
  onClose,
  order,
  products,
  handleUpdateStatus,
  onRefresh,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const { location } = useRiderLocation();
  const [isMapOpen, setIsMapOpen] = useState(false);

  useEffect(() => {
    if (isVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [isVisible, fadeAnim]);

  const openGoogleMaps = (address) => {
    if (!address) return;
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${address.latitude},${address.longitude}`;
    const label = "Delivery Location";
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    setIsMapOpen(true);
    Linking.openURL(url);
  };

  const renderEarnings = () => {
    if (!order) return "N/A";
    if (order.status === "ACCEPTED" || order.rider_earnings === 0) {
      return `Estimated: RM${order.delivery_fee?.toFixed(2) ?? "0.00"}`;
    }
    return `RM${order.rider_earnings?.toFixed(2) ?? "0.00"}`;
  };

  const handleClose = useCallback(() => {
    setIsMapOpen(false);
    onClose();
  }, [onClose]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const riderId = await AsyncStorage.getItem("userId");
      await handleUpdateStatus(orderId, newStatus, riderId, location);
    } catch (error) {
      console.error("Error updating order status:", error);
      Alert.alert("Error", "Failed to update order status. Please try again.");
    }
  };

  const renderOrderContent = () => {
    if (!order) return null;

    return (
      <>
        <View style={styles.bottomSheetHeader}>
          <Text style={styles.bottomSheetTitle}>
            Order #{order.id?.toString().padStart(5, "0") ?? "N/A"}
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          {/* Order Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Info</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              <Text style={[styles.value, styles.statusText]}>
                {order.status ?? "N/A"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Order Date:</Text>
              <Text style={styles.value}>
                {order.created_at
                  ? new Date(order.created_at).toLocaleString()
                  : "N/A"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Delivery Time:</Text>
              <Text style={styles.value}>{order.delivery_time ?? "N/A"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Your Earnings:</Text>
              <Text style={[styles.value, styles.earningsText]}>
                {renderEarnings()}
              </Text>
            </View>
          </View>

          {/* Customer Details */}
          {order.delivery_address && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Customer Details</Text>
              <Text style={styles.customerName}>
                {order.customer_name ?? "N/A"}
              </Text>
              <Text style={styles.customerPhone}>
                {order.customer_phone ?? "N/A"}
              </Text>
              <Text style={styles.customerAddress}>
                {order.delivery_address.address_line1 ?? "N/A"}
              </Text>
              <Text style={styles.customerAddress}>
                {order.delivery_address.address_line2 ?? ""}
              </Text>
              <Text style={styles.customerAddress}>
                {`${order.delivery_address.city ?? ""}, ${
                  order.delivery_address.state ?? ""
                } ${order.delivery_address.postal_code ?? ""}`}
              </Text>
              <Text style={styles.customerAddress}>
                {order.delivery_address.country ?? ""}
              </Text>
            </View>
          )}

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Order Items</Text>
              {order.items.map((item, index) => (
                <View key={index} style={styles.orderItem}>
                  <Text style={styles.itemName}>
                    {products && products[item.product_id]
                      ? products[item.product_id].name
                      : "Unknown Product"}
                  </Text>
                  <Text style={styles.itemQuantity}>x{item.quantity ?? 0}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {order.delivery_address && (
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => openGoogleMaps(order.delivery_address)}
            >
              <Icon name="map-marker" size={24} color="#fff" />
              <Text style={styles.buttonText}>Open in Maps</Text>
            </TouchableOpacity>
          )}

          {order.status === "ACCEPTED" && (
            <TouchableOpacity
              style={styles.updateStatusButton}
              onPress={() => handleStatusUpdate(order.id, "RIDER_ACCEPTED")}
            >
              <Text style={styles.buttonText}>Accept Order</Text>
            </TouchableOpacity>
          )}
          {order.status === "RIDER_ACCEPTED" && (
            <TouchableOpacity
              style={styles.updateStatusButton}
              onPress={() => handleStatusUpdate(order.id, "ON_THE_WAY")}
            >
              <Text style={styles.buttonText}>Start Delivery</Text>
            </TouchableOpacity>
          )}
          {order.status === "ON_THE_WAY" && (
            <TouchableOpacity
              style={styles.updateStatusButton}
              onPress={() => handleStatusUpdate(order.id, "DELIVERED")}
            >
              <Text style={styles.buttonText}>Complete Delivery</Text>
            </TouchableOpacity>
          )}
        </View>
      </>
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleClose}
      onSwipeComplete={handleClose}
      swipeDirection={["down"]}
      style={styles.bottomSheet}
      propagateSwipe
      useNativeDriverForBackdrop
    >
      <View
        style={[styles.bottomSheetContent, { maxHeight: SCREEN_HEIGHT * 0.8 }]}
      >
        {!order ? (
          <NoOrder fadeAnim={fadeAnim} onRefresh={onRefresh} />
        ) : (
          renderOrderContent()
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    justifyContent: "flex-end",
    margin: 0,
  },
  bottomSheetContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  scrollView: {
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  label: {
    fontWeight: "500",
  },
  value: {
    color: "#666",
  },
  statusText: {
    fontWeight: "bold",
    color: "#5E17EB",
  },
  earningsText: {
    fontWeight: "bold",
    color: "#00A86B",
  },
  customerName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  customerPhone: {
    fontSize: 14,
    marginBottom: 10,
  },
  customerAddress: {
    fontSize: 14,
    color: "#666",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  itemName: {
    flex: 1,
  },
  itemQuantity: {
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  mapButton: {
    backgroundColor: "#5E17EB",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  updateStatusButton: {
    backgroundColor: "#00A86B",
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  noOrdersContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noOrdersText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    textAlign: "center",
  },
  noOrdersSubText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  refreshButton: {
    backgroundColor: "#5E17EB",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  refreshButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default BottomSheet;
