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
  Alert,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { COLLECTIONS } from "../../constants/firebase";
import { db } from "../../services/firebase/firebaseConfig";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { StoreStackParamList } from "../../types/navigation";
import { readOneDoc } from "../../services/firebase/firebaseHelper";
import { UserStore } from "../../hooks/useUserStores";
import { PriceRecord } from "../../types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import StoreLogo from "../../components/StoreLogo";
import { StoreBrand } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { StorePriceRecordList } from "../../components/lists/StorePriceRecordList";
import {
  getUserStoreById,
  getStorePriceRecords,
  toggleStoreFavorite,
  deleteStore,
} from "../../services/userStoreService";
import { useBrands } from "../../hooks/useBrands";

type StoreDetailRouteProp = RouteProp<StoreStackParamList, "StoreDetail">;
type StoreDetailNavigationProp = NativeStackNavigationProp<StoreStackParamList>;

const StoreDetailScreen = () => {
  const route = useRoute<StoreDetailRouteProp>();
  const navigation = useNavigation<StoreDetailNavigationProp>();
  const { storeId } = route.params;
  const { userId } = useAuth();
  const [store, setStore] = useState<UserStore | null>(null);
  const [brand, setBrand] = useState<StoreBrand | null>(null);
  const [priceRecords, setPriceRecords] = useState<PriceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { brands } = useBrands();

  useEffect(() => {
    const loadStoreData = async () => {
      try {
        setLoading(true);
        const storeData = await getUserStoreById(userId!, storeId);
        if (!storeData) {
          setError("Store not found");
          return;
        }
        setStore(storeData);

        if (storeData.brand_id) {
          const brandData = brands.find((b) => b.id === storeData.brand_id);
          if (brandData) {
            setBrand(brandData);
          }
        }
      } catch (err) {
        console.error("Error loading store data:", err);
        setError("Failed to load store data");
      } finally {
        setLoading(false);
      }
    };

    loadStoreData();
  }, [userId, storeId, brands]);

  useEffect(() => {
    const fetchPriceRecords = async () => {
      if (!store || !userId) return;

      try {
        setLoading(true);
        const records = await getStorePriceRecords(userId, storeId);
        setPriceRecords(records);
      } catch (err) {
        console.error("Error fetching price records:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPriceRecords();
  }, [store, storeId, userId]);

  const handleToggleFavorite = async () => {
    if (!store) return;

    try {
      const storeDocPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_STORES}/${storeId}`;

      await updateDoc(doc(db, storeDocPath), {
        is_favorite: !store.is_favorite,
        updated_at: new Date(),
      });

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

  const handleDeleteStore = async () => {
    if (!store) return;

    Alert.alert(
      "Delete Store",
      "Are you sure you want to delete this store? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const storeDocPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_STORES}/${storeId}`;

              await deleteDoc(doc(db, storeDocPath));
              Alert.alert("Success", "Store deleted successfully");
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting store:", error);
              Alert.alert(
                "Error",
                "Failed to delete the store. Please try again."
              );
            }
          },
        },
      ]
    );
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
        <View style={styles.headerButtons}>
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
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate("EditStore", { storeId: storeId })
            }
          >
            <MaterialCommunityIcons
              name="pencil"
              size={30}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteStore}
          >
            <MaterialCommunityIcons
              name="delete-outline"
              size={30}
              color={colors.negative}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.storeInfoCard}>
        <View style={styles.storeLogoContainer}>
          {brand ? (
            <StoreLogo brand={brand.logo} width={80} height={80} />
          ) : (
            <View style={styles.storeLogo}></View>
          )}
        </View>
        <View style={styles.storeDetails}>
          <Text style={styles.storeName}>{store.name}</Text>
          <Text style={styles.storeAddress}>{store.address}</Text>
        </View>
      </View>

      <View style={styles.recordsSection}>
        <StorePriceRecordList records={priceRecords} loading={loading} />
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
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  favoriteButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  storeInfoCard: {
    flexDirection: "row",
    padding: 16,
    borderBottomColor: colors.lightGray2,
  },
  storeLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  storeLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F5F5F5",
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
  errorText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "red",
  },
});

export default StoreDetailScreen;
