import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import MapView, { Marker, Region, LatLng } from 'react-native-maps';
import * as Location from 'expo-location';

const MapComponent: React.FC = () => {
  const [pins, setPins] = useState<LatLng[]>([]);
  const [location, setLocation] = useState<Region | null>(null); 
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
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        setErrorMsg('Error getting location');
        console.error(error);
      }
    };

    getLocation();
  }, []);


  const handleMapPress = (e: any): void => {
    const coordinate = e.nativeEvent.coordinate;
    setPins((prevPins) => [...prevPins, coordinate]); 
  };

  useEffect(() => {
    if (errorMsg) {
      Alert.alert('位置获取失败', errorMsg);
    }
  }, [errorMsg]);

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
        </MapView>
      ) : (
        <Text>loading...</Text>
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
  pinsInfo: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    position: 'absolute',
    bottom: 10,
    left: 10,
    borderRadius: 10,
  },
});

export default MapComponent;
