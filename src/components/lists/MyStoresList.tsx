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
import { calculateDistance, formatDistance } from "../../utils/distance";
import { StoreBrand } from "../../types";
import { readOneDoc } from "../../services/firebase/firebaseHelper";
import { useAuth } from "../../contexts/AuthContext";
interface StoreWithBrand extends UserStore {
  brand?: StoreBrand | null;
}

interface MyStoresListProps {
  stores: UserStore[];
}

const MyStoresList: React.FC<MyStoresListProps> = ({ stores }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<StoreStackParamList>>();
  const { userId } = useAuth();
  const { userLocation } = useLocation();
  const [storesWithBrands, setStoresWithBrands] = useState<StoreWithBrand[]>(
    []
  );

  useEffect(() => {
    const fetchBrandsForStores = async () => {
      const storesWithBrandPromises = stores.map(async (store) => {
        if (store.brand_id) {
          const brandPath = `${COLLECTIONS.STORE_BRANDS}`;
          const brandData = await readOneDoc<StoreBrand>(
            brandPath,
            store.brand_id
          );
          return {
            ...store,
            brand: brandData || null,
          };
        }
        return {
          ...store,
          brand: null,
        };
      });

      const results = await Promise.all(storesWithBrandPromises);
      setStoresWithBrands(results);
    };

    fetchBrandsForStores();
  }, [stores]);

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

  const getDistance = (store: UserStore): string | null => {
    if (!userLocation || !store.location) return null;

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      store.location.latitude,
      store.location.longitude
    );

    return formatDistance(distance);
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
          distance={getDistance(item)}
          address={item.address}
          city={item.address.split(",").slice(1).join(",").trim()}
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
