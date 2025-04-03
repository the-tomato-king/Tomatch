import React from "react";
import { View, StyleSheet, Text } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { NearbyStore } from "../types/location";

interface MapComponentProps {
  onStoreSelect: (store: NearbyStore) => void;
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  lastSavedLocation: {
    latitude: number;
    longitude: number;
  } | null;
  stores: NearbyStore[];
}

const MapComponent: React.FC<MapComponentProps> = ({
  onStoreSelect,
  userLocation,
  lastSavedLocation,
  stores,
}) => {
  const handleStorePress = (store: NearbyStore) => {
    onStoreSelect(store);
  };

  const displayLocation = userLocation || lastSavedLocation;

  return (
    <View style={styles.container}>
      {displayLocation ? (
        <MapView
          style={styles.map}
          region={{
            latitude: displayLocation.latitude,
            longitude: displayLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {/* User Location Marker */}
          <Marker
            coordinate={{
              latitude: displayLocation.latitude,
              longitude: displayLocation.longitude,
            }}
          >
            <View style={styles.userLocationOuter}>
              <View style={styles.userLocationInner} />
            </View>
          </Marker>

          {/* Store Markers */}
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
  },
  map: {
    width: "100%",
    height: "100%",
  },
  userLocationOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(56, 128, 255, 0.3)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  userLocationInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#3880ff",
    borderWidth: 2,
    borderColor: "#fff",
  },
  storeName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
});

export default MapComponent;
