import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import MapComponent from "../../components/Map";
import { ShoppingStackParamList } from "../../types/navigation";
import { useLocation } from "../../contexts/LocationContext";
import LocationSelector from "../../components/LocationSelector";
import { NearbyStore } from "../../types/location";
import { useUserStores } from "../../hooks/useUserStores";

const SupermarketMapScreen = () => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<ShoppingStackParamList, "SupermarketMap">
    >();
  const route = useRoute<RouteProp<ShoppingStackParamList, "SupermarketMap">>();
  const { userLocation, nearbyStores, isLoadingLocation, lastSavedLocation } =
    useLocation();

  const [selectedStore, setSelectedStore] = useState<NearbyStore | null>(null);

  const handleSelectStore = (store: NearbyStore) => {
    setSelectedStore(store);
  };

  const handleConfirmStore = () => {
    if (selectedStore) {
      const storeData = {
        name: selectedStore.name,
        address: selectedStore.address,
        latitude: selectedStore.coordinate.latitude,
        longitude: selectedStore.coordinate.longitude,
      };
      if (route.params?.onSelectStore) {
        route.params.onSelectStore(storeData);
      }

      navigation.goBack();
    } else {
      alert("Please select a store.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.locationSection}>
        <LocationSelector
          address={userLocation?.address || null}
          isLoading={isLoadingLocation}
          onLocationSelect={() => {}}
        />
      </View>
      <View style={styles.mapContainer}>
        <MapComponent
          onStoreSelect={handleSelectStore}
          userLocation={userLocation}
          lastSavedLocation={lastSavedLocation}
          stores={nearbyStores}
        />
      </View>
      {selectedStore && (
        <View style={styles.storeInfoCard}>
          <Text style={styles.cardTitle}>Selected Store:</Text>
          <Text style={styles.storeName}>{selectedStore.name}</Text>
          <Text style={styles.storeAddress}>{selectedStore.address}</Text>
          <TouchableOpacity
            onPress={handleConfirmStore}
            style={styles.confirmButton}
          >
            <Text style={styles.buttonText}>Confirm Selection</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  locationSection: {
    position: "absolute",
    top: 20, 
    left: 8,
    right: 16,
    zIndex: 10,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  mapContainer: {
    flex: 1,
  },
  storeInfoCard: {
    position: "absolute",
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a73e8",
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    color: "#666",
  },
  confirmButton: {
    backgroundColor: "#1a73e8",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default SupermarketMapScreen;
