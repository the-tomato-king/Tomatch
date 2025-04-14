import React, { useState, useEffect } from "react";
import { FlatList, Text } from "react-native";
import { UserStore } from "../../types";
import StoreCard from "../StoreCard";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StoreStackParamList } from "../../types/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { COLLECTIONS } from "../../constants/firebase";
import { useLocation } from "../../contexts/LocationContext";
import { StoreBrand } from "../../types";
import { readOneDoc } from "../../services/firebase/firebaseHelper";
import { useAuth } from "../../contexts/AuthContext";
import { calculateDistance, formatDistance } from "../../utils/distance";
import { useBrands } from "../../hooks/useBrands";

interface StoreWithBrand extends UserStore {
  brand?: StoreBrand | null;
  distance?: string;
}

interface MyStoresListProps {
  stores: UserStore[];
}

const MyStoresList: React.FC<MyStoresListProps> = ({ stores }) => {
  const { userLocation } = useLocation();
  const navigation =
    useNavigation<NativeStackNavigationProp<StoreStackParamList>>();
  const { userId } = useAuth();
  const [storesWithBrands, setStoresWithBrands] = useState<StoreWithBrand[]>(
    []
  );
  const { brands } = useBrands();

  const processStores = (stores: UserStore[]) => {
    console.log("Processing stores with location:", {
      userLocation,
      storesCount: stores.length,
      firstStoreLocation: stores[0]?.location,
    });

    return stores.map((store) => {
      const distance =
        userLocation && store.location
          ? calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              store.location.latitude,
              store.location.longitude
            )
          : undefined;

      console.log("Store distance calculation:", {
        storeName: store.name,
        hasUserLocation: !!userLocation,
        hasStoreLocation: !!store.location,
        calculatedDistance: distance,
        formattedDistance: distance ? formatDistance(distance) : undefined,
      });

      return {
        ...store,
        distance: distance ? formatDistance(distance) : undefined,
      };
    });
  };

  useEffect(() => {
    const fetchBrandsForStores = async () => {
      console.log("Fetching brands for stores:", {
        storesCount: stores.length,
        hasUserLocation: !!userLocation,
      });

      const storesWithBrandPromises = processStores(stores).map(
        async (store) => {
          if (store.brand_id) {
            const brandData = brands.find((b) => b.id === store.brand_id);
            return {
              ...store,
              brand: brandData || null,
            };
          }
          return {
            ...store,
            brand: null,
          };
        }
      );

      const results = await Promise.all(storesWithBrandPromises);
      console.log("Final processed stores:", {
        resultsCount: results.length,
        firstStoreDistance: results[0]?.distance,
      });
      setStoresWithBrands(results);
    };

    fetchBrandsForStores();
  }, [stores, userLocation, brands]);

  const handleToggleFavorite = async (id: string, currentStatus: boolean) => {
    try {
      const storeDocPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_STORES}/${id}`;

      await updateDoc(doc(db, storeDocPath), {
        is_favorite: !currentStatus,
        updated_at: new Date(),
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  return stores.length === 0 ? (
    <Text style={{ textAlign: "center", marginTop: 20 }}>
      No stores added yet
    </Text>
  ) : (
    <FlatList
      data={storesWithBrands}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <StoreCard
          name={item.name}
          distance={item.distance || null}
          address={item.address}
          isFavorite={item.is_favorite}
          brand={item.brand}
          onToggleFavorite={() =>
            handleToggleFavorite(item.id, item.is_favorite)
          }
          onPress={() =>
            navigation.navigate("StoreDetail", { storeId: item.id })
          }
        />
      )}
    />
  );
};

export default MyStoresList;
