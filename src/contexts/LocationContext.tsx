import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { UserLocation, NearbyStore } from "../types/location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

interface LocationContextType {
  userLocation: UserLocation | null;
  nearbyStores: NearbyStore[];
  isLoadingLocation: boolean;
  setUserLocationAndStores: (location: UserLocation) => Promise<void>;
  clearLocation: () => void;
  lastSavedLocation: UserLocation | null;
  lastSavedStores: NearbyStore[];
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearbyStores, setNearbyStores] = useState<NearbyStore[]>([]);
  const [lastSavedLocation, setLastSavedLocation] =
    useState<UserLocation | null>(null);
  const [lastSavedStores, setLastSavedStores] = useState<NearbyStore[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const initializeLocation = async () => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      setIsLoadingLocation(true);
      // Get current location
      const location = await Location.getCurrentPositionAsync({});

      // Update location and fetch nearby stores
      await setUserLocationAndStores({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: "", // Address will be empty initially
      });
    } catch (error) {
      console.error("Error initializing location:", error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedLocation = await AsyncStorage.getItem("lastLocation");
        const savedStores = await AsyncStorage.getItem("lastStores");

        if (savedLocation) {
          setLastSavedLocation(JSON.parse(savedLocation));
        }
        if (savedStores) {
          setLastSavedStores(JSON.parse(savedStores));
        }

        // After loading saved data, try to get current location
        await initializeLocation();
      } catch (error) {
        console.error("Error loading saved location data:", error);
      }
    };

    loadSavedData();
  }, []);

  const fetchNearbyStores = async (latitude: number, longitude: number) => {
    const radius = 5000; // 5km
    const type = "supermarket";
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    try {
      let response = await fetch(url);
      let data = await response.json();
      if (data.results) {
        return data.results.map((store: any) => ({
          id: store.place_id,
          name: store.name,
          coordinate: {
            latitude: store.geometry.location.lat,
            longitude: store.geometry.location.lng,
          },
          address: store.vicinity,
          latitude: store.geometry.location.lat,
          longitude: store.geometry.location.lng,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching stores:", error);
      return [];
    }
  };

  const setUserLocationAndStores = async (location: UserLocation) => {
    setIsLoadingLocation(true);
    try {
      setUserLocation(location);
      const stores = await fetchNearbyStores(
        location.latitude,
        location.longitude
      );
      setNearbyStores(stores);

      await AsyncStorage.setItem("lastLocation", JSON.stringify(location));
      await AsyncStorage.setItem("lastStores", JSON.stringify(stores));

      setLastSavedLocation(location);
      setLastSavedStores(stores);
    } catch (error) {
      console.error("Error updating location and stores:", error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const clearLocation = useCallback(() => {
    setUserLocation(null);
    setNearbyStores([]);
  }, []);

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        nearbyStores,
        isLoadingLocation,
        setUserLocationAndStores,
        clearLocation,
        lastSavedLocation,
        lastSavedStores,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
