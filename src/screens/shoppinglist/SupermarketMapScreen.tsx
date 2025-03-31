import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack"; 
import MapComponent from "../../components/Map";
import { LatLng } from "react-native-maps";
import { ShoppingStackParamList } from "../../types/navigation"; 

interface Store {
  name: string;
  coordinate: LatLng;
  address: string;
  latitude: number;   
  longitude: number; 
}

type SupermarketMapScreenNavigationProp = NativeStackNavigationProp<
  ShoppingStackParamList,
  "SupermarketMap"
>;

interface SupermarketMapScreenProps {
  navigation: SupermarketMapScreenNavigationProp;
}

const SupermarketMapScreen: React.FC<SupermarketMapScreenProps> = ({ navigation }) => {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const handleSelectStore = (store: Store) => {
    setSelectedStore(store);
  };

  const handleConfirmStore = () => {
    if (selectedStore) {
      navigation.navigate("AddShoppingList", {
        selectedLocation: {
          name: selectedStore.name,
          address: selectedStore.address,
          latitude: selectedStore.coordinate.latitude,
          longitude: selectedStore.coordinate.longitude,
        },
      });
    } else {
      alert("Please select a store.");
    }
  };

  return (
    <View style={styles.container}>
      <MapComponent onStoreSelect={handleSelectStore} />
      {selectedStore && (
        <View style={styles.storeInfoCard}>
          <Text style={styles.cardTitle}>Selected Store:</Text>
          <Text style={styles.storeName}>{selectedStore.name}</Text>
          <Text style={styles.storeAddress}>{selectedStore.address}</Text>
          <View style={styles.container}>
            <TouchableOpacity
              onPress={handleConfirmStore}
              style={styles.confirmButton}
            >
              <Text style={styles.buttonText}>Confirm Selection</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
