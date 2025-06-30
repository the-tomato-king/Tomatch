import { NearbyStore } from "../types/location";
import { UserStore } from "../hooks/useUserStores";

export const convertNearbyStoreToUserStore = (
  nearbyStore: NearbyStore
): Omit<UserStore, "id"> => {
  return {
    name: nearbyStore.name,
    address: nearbyStore.address,
    location: {
      latitude: nearbyStore.coordinate.latitude,
      longitude: nearbyStore.coordinate.longitude,
    },
    created_at: new Date(),
    updated_at: new Date(),
    is_favorite: false,
    last_visited: new Date(),
    is_inactive: false,
  };
};
