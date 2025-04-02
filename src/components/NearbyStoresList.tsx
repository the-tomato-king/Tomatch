import React from "react";
import { FlatList } from "react-native";
import { NearbyStore } from "../types/location";
import StoreCard from "./StoreCard";
import { calculateDistance, formatDistance } from "../utils/distance";
import { useLocation } from "../contexts/LocationContext";

interface NearbyStoresListProps {
  stores: NearbyStore[];
  onFavorite: (store: NearbyStore) => Promise<void>;
}

const NearbyStoresList: React.FC<NearbyStoresListProps> = ({
  stores,
  onFavorite,
}) => {
  const { userLocation } = useLocation();

  const getDistance = (store: NearbyStore): string => {
    if (!userLocation) return "Unknown";

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      store.latitude,
      store.longitude
    );

    return formatDistance(distance);
  };

  return (
    <FlatList
      data={stores}
      keyExtractor={(store) => store.id}
      renderItem={({ item: store }) => (
        <StoreCard
          name={store.name}
          distance={getDistance(store)}
          address={store.address}
          city={store.address.split(",").slice(1).join(",").trim()}
          isFavorite={false}
          onToggleFavorite={() => onFavorite(store)}
          onPress={() => {}}
        />
      )}
    />
  );
};

export default NearbyStoresList;
