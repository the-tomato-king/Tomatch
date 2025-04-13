import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";
import { COLLECTIONS } from "../constants/firebase";
import { BaseUserStore } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "../contexts/LocationContext";
import { calculateDistance, formatDistance } from "../utils/distance";

export interface UserStore extends BaseUserStore {
  id: string;
  distance?: string; // can be calculated by user's location and store's location
}

export function useUserStores() {
  const [favoriteStores, setFavoriteStores] = useState<UserStore[]>([]);
  const [allStores, setAllStores] = useState<UserStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();
  const { userLocation } = useLocation();

  const userStoresPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_STORES}`;

  const processStores = (stores: UserStore[]) => {
    return stores
      .map((store) => {
        const distance =
          userLocation && store.location
            ? calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                store.location.latitude,
                store.location.longitude
              )
            : undefined;

        return {
          ...store,
          distance: distance ? formatDistance(distance) : undefined,
          distanceValue: distance, // for sorting
        };
      })
      .sort(
        (a, b) => (a.distanceValue || Infinity) - (b.distanceValue || Infinity)
      );
  };

  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(
        collection(db, userStoresPath),
        (snapshot) => {
          const stores = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          })) as UserStore[];

          const processedStores = processStores(stores);
          const favorites = processedStores.filter(
            (store) => store.is_favorite
          );

          setFavoriteStores(favorites);
          setAllStores(processedStores);
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching user stores:", err);
          setError("Failed to load stores");
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up stores listener:", err);
      setError("Failed to load stores");
      setLoading(false);
    }
  }, [userId, userLocation]);

  return {
    favoriteStores,
    allStores,
    loading,
    error,
    getNearestStore: () => allStores[0], // because it's sorted, the first one is the nearest
  };
}
