import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { COLLECTIONS } from "../constants/firebase";
import { db } from "../services/firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { StoreStackParamList } from "../types/navigation";
import { readOneDoc } from "../services/firebase/firebaseHelper";
import { UserStore } from "../hooks/useUserStores";
import { UserProduct, Product } from "../types";

type StoreDetailRouteProp = RouteProp<StoreStackParamList, "StoreDetail">;

interface PriceRecord {
  id: string;
  user_product_id: string;
  store_id: string;
  price: number;
  unit_type: string;
  recorded_at: Date;
  product?: {
    name: string;
    category: string;
  };
}

const StoreDetailScreen = () => {
  const route = useRoute<StoreDetailRouteProp>();
  const navigation = useNavigation();
  const { storeId } = route.params;

  const [store, setStore] = useState<UserStore | null>(null);
  const [priceRecords, setPriceRecords] = useState<PriceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        // TODO: get user id from auth
        const userId = "user123";
        const storeDocPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_STORES}`;

        const storeData = await readOneDoc<UserStore>(storeDocPath, storeId);
        if (storeData) {
          setStore(storeData);
        } else {
          setError("Store not found");
        }
      } catch (err) {
        console.error("Error fetching store details:", err);
        setError("Failed to load store details");
      }
    };

    fetchStoreDetails();
  }, [storeId]);

  useEffect(() => {
    const fetchPriceRecords = async () => {
      if (!store) return;

      try {
        // TODO: get user id from auth
        const userId = "user123";
        const priceRecordsPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.PRICE_RECORDS}`;

        const q = query(
          collection(db, priceRecordsPath),
          where("store_id", "==", storeId)
        );

        const querySnapshot = await getDocs(q);
        const recordPromises = querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const record: PriceRecord = {
            id: doc.id,
            user_product_id: data.user_product_id,
            store_id: data.store_id,
            price: data.price || 0,
            unit_type: data.unit_type || "each",
            recorded_at: data.recorded_at?.toDate() || new Date(),
          };

          if (record.user_product_id) {
            const userProductPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;
            const userProduct = await readOneDoc<UserProduct>(
              userProductPath,
              record.user_product_id
            );

            if (userProduct && userProduct.product_id) {
              const productData = await readOneDoc<Product>(
                COLLECTIONS.PRODUCTS,
                userProduct.product_id
              );
              if (productData) {
                record.product = {
                  name: productData.name,
                  category: productData.category,
                };
              }
            }
          }

          return record;
        });

        const records = await Promise.all(recordPromises);
        setPriceRecords(records);
      } catch (err) {
        console.error("Error fetching price records:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPriceRecords();
  }, [store, storeId]);

  // 切换收藏状态
  const handleToggleFavorite = async () => {
    if (!store) return;

    try {
      // 暂时使用固定的用户ID
      const userId = "user123";
      const storeDocPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_STORES}/${storeId}`;

      // 更新收藏状态
      await updateDoc(doc(db, storeDocPath), {
        is_favorite: !store.is_favorite,
        updated_at: new Date(),
      });

      // 更新本地状态
      setStore({
        ...store,
        is_favorite: !store.is_favorite,
      });

      console.log(
        `Toggled favorite for store ${storeId} to ${!store.is_favorite}`
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !store) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error || "Store not found"}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="chevron-left" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Store Details</Text>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleToggleFavorite}
        >
          <MaterialCommunityIcons
            name={store.is_favorite ? "heart" : "heart-outline"}
            size={30}
            color={colors.negative}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.storeInfoCard}>
        <View style={styles.storeLogoContainer}>
          <View style={styles.storeLogo}></View>
        </View>
        <View style={styles.storeDetails}>
          <Text style={styles.storeName}>{store.name}</Text>
          <Text style={styles.storeAddress}>{store.address}</Text>
          <Text style={styles.storeCity}>
            {store.address.split(",").slice(1).join(",").trim()}
          </Text>
        </View>
      </View>

      <View style={styles.recordsSection}>
        <View style={styles.recordsHeader}>
          <Text style={styles.recordsTitle}>Records</Text>
          <TouchableOpacity style={styles.sortButton}>
            <MaterialCommunityIcons name="sort" size={24} color="black" />
            <Text style={styles.sortText}>Sort by</Text>
          </TouchableOpacity>
        </View>

        {priceRecords.length === 0 ? (
          <Text style={styles.emptyRecordsText}>
            No price records for this store yet
          </Text>
        ) : (
          <FlatList
            data={priceRecords}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.recordItem}>
                <Text style={styles.productName}>
                  {item.product?.name || "Unknown Product"}
                </Text>
                <Text style={styles.priceText}>
                  ${item.price.toFixed(2)}/{item.unit_type}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  favoriteButton: {
    padding: 8,
  },
  storeInfoCard: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray2,
  },
  storeLogoContainer: {
    marginRight: 16,
  },
  storeLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  storeDetails: {
    flex: 1,
    justifyContent: "center",
  },
  storeName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  storeAddress: {
    fontSize: 16,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  storeCity: {
    fontSize: 16,
    color: colors.secondaryText,
  },
  recordsSection: {
    flex: 1,
    padding: 16,
  },
  recordsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  recordsTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortText: {
    marginLeft: 4,
    fontSize: 16,
  },
  recordItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray2,
  },
  productName: {
    fontSize: 18,
  },
  priceText: {
    fontSize: 18,
    fontWeight: "500",
  },
  emptyRecordsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: colors.secondaryText,
  },
  errorText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "red",
  },
});

export default StoreDetailScreen;
