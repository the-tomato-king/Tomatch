import React, { createContext, useState, useContext, useCallback } from "react";
import { UserLocation, NearbyStore } from "../types/location";

interface LocationContextType {
  userLocation: UserLocation | null;
  nearbyStores: NearbyStore[];
  isLoadingLocation: boolean;
  setUserLocationAndStores: (location: UserLocation) => Promise<void>;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearbyStores, setNearbyStores] = useState<NearbyStore[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const fetchNearbyStores = async (latitude: number, longitude: number) => {
    const radius = 5000; // 5km
    const type = "supermarket";
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    try {
      let response = await fetch(url);
      let data = await response.json();
      if (data.results) {
        const stores = data.results.map((store: any) => ({
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
        setNearbyStores(stores);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const setUserLocationAndStores = useCallback(
    async (location: UserLocation) => {
      setIsLoadingLocation(true);
      setUserLocation(location);
      await fetchNearbyStores(location.latitude, location.longitude);
      setIsLoadingLocation(false);
    },
    []
  );

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
