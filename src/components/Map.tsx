import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, Region, LatLng, Callout } from 'react-native-maps';
import * as Location from 'expo-location';

interface Store {
  name: string;
  coordinate: LatLng;
  address: string;
}

interface MapComponentProps {
  onStoreSelect: (store: Store) => void; 
}

const MapComponent: React.FC<MapComponentProps> = ({ onStoreSelect }) => {
  const [pins, setPins] = useState<LatLng[]>([]);
  const [location, setLocation] = useState<Region | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        const locationData = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = locationData.coords;

        setLocation({
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });

        fetchNearbyStores(latitude, longitude);
      } catch (error) {
        setErrorMsg('Error getting location');
        console.error(error);
      }
    };

    getLocation();
  }, []);

  const fetchNearbyStores = async (latitude: number, longitude: number) => {
    const radius = 5000; // 5km
    const type = 'supermarket'; // or grocery_store

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    try {
      let response = await fetch(url);
      let data = await response.json();
      if (data.results) {
        const storeLocations = data.results.map((store: any) => ({
          name: store.name,
          coordinate: {
            latitude: store.geometry.location.lat,
            longitude: store.geometry.location.lng,
          },
          address: store.vicinity,
        }));
        setStores(storeLocations);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const handleMapPress = (e: any): void => {
    const coordinate = e.nativeEvent.coordinate;
    setPins((prevPins) => [...prevPins, coordinate]);
  };

  const handleStorePress = (store: Store) => {
    onStoreSelect(store); 
  };

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          style={styles.map}
          initialRegion={location}
          region={location}
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
        <Text>Loading...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  storeName: {
    fontWeight: 'bold',
  },
});

export default MapComponent;
