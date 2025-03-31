import React, { useState } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import MapComponent from "../../components/Map";  
import { LatLng } from "react-native-maps";

interface Store {
  name: string;
  coordinate: LatLng;
  address: string;
}

const SupermarketMapScreen = () => {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null); 

  const handleSelectStore = (store: Store) => {
    setSelectedStore(store);
  };

  return (
    <View style={styles.container}>
      <MapComponent onStoreSelect={handleSelectStore} />
      {selectedStore && (
        <View style={styles.storeInfoCard}>
          <Text style={styles.cardTitle}>Selected Store:</Text>
          <Text style={styles.storeName}>{selectedStore.name}</Text>
          <Text style={styles.storeAddress}>{selectedStore.address}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',  
    paddingTop: 20,  
  },
  storeInfoCard: {
    position: 'absolute',
    bottom: 20, 
    left: 10,  
    right: 10,  
    backgroundColor: '#fff', 
    borderRadius: 10,  
    padding: 15,  
    shadowColor: '#000',  
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, 
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333', 
    marginBottom: 8,  
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a73e8',  
    marginBottom: 4,  
  },
  storeAddress: {
    fontSize: 14,
    color: '#666', 
  },
});

export default SupermarketMapScreen;

