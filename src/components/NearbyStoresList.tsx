import React from "react";
import { FlatList } from "react-native";
import { NearbyStore } from "../types/location";
import StoreCard from "./StoreCard";
import { calculateDistance, formatDistance } from "../utils/distance";
import { useLocation } from "../contexts/LocationContext";
import { UserStore } from "../hooks/useUserStores";

interface NearbyStoresListProps {
  stores: NearbyStore[];
  onFavorite: (store: NearbyStore) => Promise<void>;
  favoriteStores: UserStore[];
}

const NearbyStoresList: React.FC<NearbyStoresListProps> = ({
  stores,
  onFavorite,
  favoriteStores,
}) => {
  const { userLocation } = useLocation();

  const isStoreAdded = (store: NearbyStore): boolean => {
    return favoriteStores.some(
      (userStore) =>
        userStore.name === store.name && userStore.address === store.address
    );
  };

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
      renderItem={({ item: store }) => {
        const added = isStoreAdded(store);
        return (
          <StoreCard
            name={store.name}
            distance={getDistance(store)}
            address={store.address}
            city={store.address.split(",").slice(1).join(",").trim()}
            showAddButton={!added}
            onAdd={() => onFavorite(store)}
            onPress={() => {}}
          />
        );
      }}
    />
  );
};

export default NearbyStoresList;
