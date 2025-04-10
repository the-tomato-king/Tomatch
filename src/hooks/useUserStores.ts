import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";
import { COLLECTIONS } from "../constants/firebase";
import { BaseUserStore } from "../types";
import { useAuth } from "../contexts/AuthContext";
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

  useEffect(() => {
    const userStoresPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_STORES}`;

    try {
      // create a listener for user stores
      const unsubscribe = onSnapshot(
        collection(db, userStoresPath),
        (snapshot) => {
          const stores = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
            // TODO: add a simulated distance value, can be calculated by user's location and store's location
            distance: `${(Math.random() * 5).toFixed(1)}km`,
          })) as UserStore[];

          // separate favorite and non-favorite stores
          const favorites = stores.filter((store) => store.is_favorite);

          setFavoriteStores(favorites);
          setAllStores(stores);
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching user stores:", err);
          setError("Failed to load stores");
          setLoading(false);
        }
      );

      // cleanup function
      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up stores listener:", err);
      setError("Failed to load stores");
      setLoading(false);
    }
  }, [userId]);

  return { favoriteStores, allStores, loading, error };
}
