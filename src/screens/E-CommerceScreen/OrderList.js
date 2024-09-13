import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  Alert,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  fetchUserOrders,
  getDriverData,
  fetchProducts,
} from "./EcomapiService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DeliveredOrderModal from "./DeliveredOrderModal";

const PURPLE = "#5B21B6";
const LIGHT_PURPLE = "#8B5CF6";
const BACKGROUND = "#F3F4F6";
const WHITE = "#FFFFFF";
const GRAY = "#6B7280";
const LIGHT_GRAY = "#E5E7EB";
const RED = "#e74c3c";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cancelledModalVisible, setCancelledModalVisible] = useState(false);
  const [riderInfo, setRiderInfo] = useState(null);
  const [products, setProducts] = useState({});
  const navigation = useNavigation();

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        const userOrders = await fetchUserOrders(token);
        setOrders(userOrders);
        const productsData = await fetchProducts(token);
        const productMap = {};
        productsData.forEach((product) => {
          productMap[product.sanity_id] = product.name;
        });
        setProducts(productMap);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      Alert.alert("Error", "Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [loadOrders]);

  const handleOrderPress = async (order) => {
    if (order.status === "DELIVERED") {
      setSelectedOrder(order);
      try {
        const token = await AsyncStorage.getItem("userToken");
        const riderData = await getDriverData(order.rider_id, token);
        setRiderInfo(riderData);
      } catch (error) {
        console.error("Error fetching rider data:", error);
        setRiderInfo(null);
      }
      setModalVisible(true);
    } else if (order.status === "CANCELLED") {
      setSelectedOrder(order);
      setCancelledModalVisible(true);
    } else {
      navigation.navigate("Delivery", { orderId: order.id });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "#FFA500"; // Orange
      case "ACCEPTED":
        return "#3498db"; // Blue
      case "RIDER_ACCEPTED":
        return "#9b59b6"; // Purple
      case "ON_THE_WAY":
        return "#2ecc71"; // Green
      case "DELIVERED":
        return "#27ae60"; // Dark Green
      case "CANCELLED":
        return "#e74c3c"; // Red
      default:
        return LIGHT_PURPLE;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "RIDER_ACCEPTED":
        return "Rider Accepted";
      case "ON_THE_WAY":
        return "On the Way";
      default:
        return status.charAt(0) + status.slice(1).toLowerCase();
    }
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>Order #{item.id}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      <Text style={styles.orderTotal}>
        Total: RM{item.total_amount.toFixed(2)}
      </Text>
      <Text style={styles.orderDate}>
        {new Date(item.created_at).toLocaleString()}
      </Text>
      <Text style={styles.deliveryAddress}>
        {item.delivery_address.address_line1}, {item.delivery_address.city}
      </Text>
      <Text style={styles.deliveryTime}>
        Estimated Delivery: {item.delivery_time}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PURPLE} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.title}>My Orders</Text>
        <TouchableOpacity onPress={loadOrders} style={styles.refreshButton}>
          <Icon name="refresh" size={24} color={WHITE} />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PURPLE} />
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[PURPLE]}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No orders found</Text>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
      {selectedOrder && (
        <>
          <DeliveredOrderModal
            isVisible={modalVisible}
            onClose={() => setModalVisible(false)}
            order={selectedOrder}
            riderInfo={riderInfo}
            products={products}
          />
          <Modal
            animationType="slide"
            transparent={true}
            visible={cancelledModalVisible}
            onRequestClose={() => setCancelledModalVisible(false)}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Order Cancelled</Text>
                <Text style={styles.orderNumber}>
                  Order #{selectedOrder.id}
                </Text>
                <Text style={styles.reasonTitle}>Reason for cancellation:</Text>
                <Text style={styles.reasonText}>
                  {selectedOrder.decline_reason || "No reason provided"}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setCancelledModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BACKGROUND,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: PURPLE,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: WHITE,
  },
  refreshButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
  },
  orderItem: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: PURPLE,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: "bold",
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: PURPLE,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: GRAY,
    marginBottom: 8,
  },
  deliveryAddress: {
    fontSize: 14,
    color: GRAY,
    marginBottom: 4,
  },
  deliveryTime: {
    fontSize: 14,
    color: GRAY,
    fontStyle: "italic",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: GRAY,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: RED,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  reasonText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: PURPLE,
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  closeButtonText: {
    color: WHITE,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default OrderList;
