import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';

// Types for places from Google Places API
export interface Place {
  id: string;
  name: string;
  vicinity: string; // address
  geometry: {
    location: {
      lat: number;
      lng: number;
    }
  }
}

interface DynamicMapProps {
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
  placeType?: string; // supermarket, restaurant, etc.
  radius?: number; // search radius in meters
  onPlaceSelect?: (place: Place) => void;
  apiKey: string; // Google Maps API key
  showAllPlaces?: boolean; // Whether to show all places or only the selected one
  selectedPlace?: Place | null;
}

const DynamicMap: React.FC<DynamicMapProps> = ({
  initialLocation,
  placeType = 'supermarket',
  radius = 5000,
  onPlaceSelect,
  apiKey,
  showAllPlaces = true,
  selectedPlace = null,
}) => {
  const [region, setRegion] = useState<Region | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [localSelectedPlace, setLocalSelectedPlace] = useState<Place | null>(selectedPlace);
  
  const mapRef = useRef<MapView>(null);

  // Initialize map with user location or provided initial location
  useEffect(() => {
    const getLocationAndPlaces = async () => {
      try {
        setLoading(true);
        
        // If initialLocation is provided, use it
        if (initialLocation) {
          const newRegion = {
            latitude: initialLocation.latitude,
            longitude: initialLocation.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          };
          setRegion(newRegion);
          fetchNearbyPlaces(initialLocation.latitude, initialLocation.longitude);
          return;
        }
        
        // Otherwise get user's current location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const { latitude, longitude } = location.coords;
        
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        };
        
        setRegion(newRegion);
        fetchNearbyPlaces(latitude, longitude);
      } catch (error) {
        console.error('Error getting location:', error);
        setErrorMsg('Failed to get your location');
        setLoading(false);
      }
    };

    getLocationAndPlaces();
  }, [initialLocation]);

  // Update localSelectedPlace when selectedPlace prop changes
  useEffect(() => {
    setLocalSelectedPlace(selectedPlace);
  }, [selectedPlace]);

  // Fetch nearby places from Google Places API
  const fetchNearbyPlaces = async (latitude: number, longitude: number) => {
    try {
      // In a real app, this should be a secure backend endpoint to protect your API key
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${placeType}&key=${apiKey}`
      );
      
      const result = await response.json();
      
      if (result.status === 'OK' && result.results) {
        setPlaces(result.results.map((place: any) => ({
          id: place.place_id,
          name: place.name,
          vicinity: place.vicinity,
          geometry: place.geometry
        })));
      } else {
        console.warn('Places API returned no results:', result.status);
        setPlaces([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      setErrorMsg('Failed to fetch nearby places');
      setLoading(false);
    }
  };

  // Handle place selection
  const handleSelectPlace = (place: Place) => {
    setLocalSelectedPlace(place);
    
    // Animate to the selected place
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
    
    // Call the provided callback
    if (onPlaceSelect) {
      onPlaceSelect(place);
    }
  };

  // Change search location on map drag
  const handleRegionChangeComplete = (newRegion: Region) => {
    // Only refetch places if the map has been moved significantly
    // This prevents excessive API calls
    if (region && 
        (Math.abs(newRegion.latitude - region.latitude) > 0.01 || 
         Math.abs(newRegion.longitude - region.longitude) > 0.01)) {
      fetchNearbyPlaces(newRegion.latitude, newRegion.longitude);
    }
    setRegion(newRegion);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.messageText}>Loading map and nearby places...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setErrorMsg(null);
            setLoading(true);
            if (initialLocation) {
              fetchNearbyPlaces(initialLocation.latitude, initialLocation.longitude);
            } else {
              // Try to get location again
              Location.getCurrentPositionAsync({}).then(location => {
                const { latitude, longitude } = location.coords;
                setRegion({
                  latitude,
                  longitude,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                });
                fetchNearbyPlaces(latitude, longitude);
              }).catch(error => {
                console.error('Error getting location:', error);
                setErrorMsg('Failed to get your location');
                setLoading(false);
              });
            }
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!region) {
    return (
      <View style={styles.centered}>
        <Text style={styles.messageText}>Unable to determine location</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {/* User's location or initial location marker */}
        <Marker
          coordinate={{
            latitude: region.latitude,
            longitude: region.longitude,
          }}
          pinColor="blue"
          title="Current Location"
        />
        
        {/* Place markers */}
        {(showAllPlaces ? places : (localSelectedPlace ? [localSelectedPlace] : [])).map((place) => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
            }}
            title={place.name}
            description={place.vicinity}
            pinColor={localSelectedPlace?.id === place.id ? 'green' : 'red'}
            onPress={() => handleSelectPlace(place)}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});

export default DynamicMap;