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
import { useAuth } from "../../contexts/AuthContext";
import { calculateDistance, formatDistance } from "../../utils/distance";

interface StoreWithDistance extends UserStore {
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
  const [storesWithDistance, setStoresWithDistance] = useState<
    StoreWithDistance[]
  >([]);

  const processStores = (stores: UserStore[]) => {
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

      return {
        ...store,
        distance: distance ? formatDistance(distance) : undefined,
      };
    });
  };

  useEffect(() => {
    const processedStores = processStores(stores);
    setStoresWithDistance(processedStores);
  }, [stores, userLocation]);

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
      data={storesWithDistance}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <StoreCard
          name={item.name}
          distance={item.distance || null}
          address={item.address}
          isFavorite={item.is_favorite}
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
