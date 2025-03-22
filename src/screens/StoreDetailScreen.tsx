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

type StoreDetailRouteProp = RouteProp<StoreStackParamList, "StoreDetail">;

// 简单的价格记录类型
interface PriceRecord {
  id: string;
  product_name: string;
  price: number;
  unit: string;
  date: Date;
}

const StoreDetailScreen = () => {
  const route = useRoute<StoreDetailRouteProp>();
  const navigation = useNavigation();
  const { storeId } = route.params;

  const [store, setStore] = useState<UserStore | null>(null);
  const [priceRecords, setPriceRecords] = useState<PriceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取商店详情
  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        // 暂时使用固定的用户ID
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

  // 获取该商店的价格记录
  useEffect(() => {
    const fetchPriceRecords = async () => {
      if (!store) return;

      try {
        // 暂时使用固定的用户ID
        const userId = "user123";
        const priceRecordsPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.PRICE_RECORDS}`;

        // 查询与该商店相关的价格记录
        const q = query(
          collection(db, priceRecordsPath),
          where("store_id", "==", storeId)
        );

        const querySnapshot = await getDocs(q);
        const records: PriceRecord[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          records.push({
            id: doc.id,
            product_name: data.product_name || "Unknown Product",
            price: data.price || 0,
            unit: data.unit || "each",
            date: data.created_at?.toDate() || new Date(),
          });
        });

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
          <View style={styles.storeLogo}>
            {/* 如果有商店logo，可以在这里显示 */}
          </View>
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
                <Text style={styles.productName}>{item.product_name}</Text>
                <Text style={styles.priceText}>
                  ${item.price.toFixed(2)}/{item.unit}
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
