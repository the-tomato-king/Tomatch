import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import MapView, { Marker, Region, LatLng, Callout } from "react-native-maps";
import { NearbyStore } from "../types/location";

interface MapComponentProps {
  onStoreSelect: (store: NearbyStore) => void;
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  stores: NearbyStore[];
}

const MapComponent: React.FC<MapComponentProps> = ({
  onStoreSelect,
  userLocation,
  stores,
}) => {
  const [pins, setPins] = useState<LatLng[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleMapPress = (e: any): void => {
    const coordinate = e.nativeEvent.coordinate;
    setPins((prevPins) => [...prevPins, coordinate]);
  };

  const handleStorePress = (store: NearbyStore) => {
    onStoreSelect(store);
  };

  return (
    <View style={styles.container}>
      {userLocation ? (
        <MapView
          style={styles.map}
          region={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onPress={handleMapPress}
        >
          {pins.map((pin, index) => (
            <Marker key={index} coordinate={pin} />
          ))}

          {stores.map((store, index) => (
            <Marker
              key={`store-${index}`}
              coordinate={store.coordinate}
              pinColor="blue"
              onPress={() => handleStorePress(store)}
            >
              <Callout>
                <Text style={styles.storeName}>{store.name}</Text>
                <Text>{store.address}</Text>
              </Callout>
            </Marker>
          ))}
        </MapView>
      ) : (
        <Text>Waiting for location...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  storeName: {
    fontWeight: "bold",
  },
});

export default MapComponent;
