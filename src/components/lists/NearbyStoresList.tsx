import React, { useEffect, useRef } from "react";
import { FlatList, ViewToken } from "react-native";
import { NearbyStore } from "../../types/location";
import StoreCard from "../StoreCard";
import { calculateDistance, formatDistance } from "../../utils/distance";
import { useLocation } from "../../contexts/LocationContext";
import { UserStore } from "../../types";

interface NearbyStoresListProps {
  stores: NearbyStore[];
  onFavorite: (store: NearbyStore) => Promise<void>;
  favoriteStores: UserStore[];
  selectedStore: NearbyStore | null;
}

const NearbyStoresList: React.FC<NearbyStoresListProps> = ({
  stores,
  onFavorite,
  favoriteStores,
  selectedStore,
}) => {
  const { userLocation } = useLocation();
  const flatListRef = useRef<FlatList>(null);

  // 当选中的商店变化时，滚动到该商店
  useEffect(() => {
    if (selectedStore && flatListRef.current) {
      const index = stores.findIndex(store => 
        store.id === selectedStore.id || 
        (store.name === selectedStore.name && 
         store.address === selectedStore.address));
      
      if (index !== -1) {
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
          viewOffset: 0,
          viewPosition: 0
        });
      }
    }
  }, [selectedStore, stores]);

  const isStoreAdded = (store: NearbyStore): boolean => {
    return favoriteStores.some(
      (userStore) =>
        userStore.name === store.name && userStore.address === store.address
    );
  };

  const getDistance = (store: NearbyStore): string | null => {
    if (!userLocation) return null;

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      store.coordinate.latitude,
      store.coordinate.longitude
    );

    return formatDistance(distance);
  };

  const isSelected = (store: NearbyStore): boolean => {
    if (!selectedStore) return false;
    return store.id === selectedStore.id || 
           (store.name === selectedStore.name && 
            store.address === selectedStore.address);
  };

  const handleScrollToIndexFailed = (info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    // 如果滚动失败，延迟后重试
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: info.index,
          animated: true,
          viewPosition: 0
        });
      }
    }, 100);
  };

  return (
    <FlatList
      ref={flatListRef}
      data={stores}
      keyExtractor={(store) => store.id || `${store.name}-${store.address}`}
      onScrollToIndexFailed={handleScrollToIndexFailed}
      renderItem={({ item: store }) => {
        const added = isStoreAdded(store);
        const selected = isSelected(store);
        return (
          <StoreCard
            name={store.name}
            distance={getDistance(store)}
            address={store.address}
            showAddButton={!added}
            onAdd={() => onFavorite(store)}
            onPress={() => {}}
            isFavorite={false}
            onToggleFavorite={() => {}}
            isHighlighted={selected}
          />
        );
      }}
    />
  );
};

export default NearbyStoresList;
