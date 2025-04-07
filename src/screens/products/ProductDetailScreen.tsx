import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../types/navigation";
import { COLLECTIONS } from "../../constants/firebase";
import {
  readOneDoc,
  readAllDocs,
} from "../../services/firebase/firebaseHelper";
import { collection, onSnapshot, query, where, doc } from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { Product, PriceRecord, UserProductStats, UserStore } from "../../types";
import LoadingLogo from "../../components/LoadingLogo";
import ProductImage from "../../components/ProductImage";
import { colors } from "../../theme/colors";
import { LinearGradient } from "expo-linear-gradient";

type ProductDetailRouteProp = RouteProp<HomeStackParamList, "ProductDetail">;
type ProductDetailScreenNavigationProp =
  NativeStackNavigationProp<HomeStackParamList>;

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const { productId, userProductId } = route.params;
  const navigation = useNavigation<ProductDetailScreenNavigationProp>();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [priceRecords, setPriceRecords] = useState<PriceRecord[]>([]);
  const [productStats, setProductStats] = useState<UserProductStats | null>(
    null
  );

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const userId = "user123"; // TODO: get user id from auth

        // monitor product change
        const productUnsubscribe = onSnapshot(
          doc(db, COLLECTIONS.PRODUCTS, productId),
          (doc) => {
            if (doc.exists()) {
              setProduct({ id: doc.id, ...doc.data() } as Product);
            }
          },
          (error) => {
            console.error("Error listening to product:", error);
          }
        );

        // monitor user product stats
        const statsPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCT_STATS}`;
        const statsUnsubscribe = onSnapshot(
          doc(db, statsPath, productId),
          (doc) => {
            if (doc.exists()) {
              setProductStats({
                id: doc.id,
                ...doc.data(),
              } as UserProductStats);
            }
          },
          (error) => {
            console.error("Error listening to product stats:", error);
          }
        );

        return () => {
          productUnsubscribe();
          statsUnsubscribe();
        };
      } catch (error) {
        console.error("Error setting up listeners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId]);

  useEffect(() => {
    const userId = "user123"; // TODO: get user id from auth
    const recordsPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.PRICE_RECORDS}`;

    const recordsQuery = query(
      collection(db, recordsPath),
      where("user_product_id", "==", userProductId)
    );

    const unsubscribe = onSnapshot(
      recordsQuery,
      async (snapshot) => {
        try {
          const filteredRecords = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as PriceRecord[];

          filteredRecords.sort((a, b) => {
            return (
              new Date(b.recorded_at).getTime() -
              new Date(a.recorded_at).getTime()
            );
          });

          const storesPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_STORES}`;
          const recordsWithStoreInfo = await Promise.all(
            filteredRecords.map(async (record) => {
              if (record.store_id) {
                const storeData = await readOneDoc<UserStore>(
                  storesPath,
                  record.store_id
                );
                return {
                  ...record,
                  store:
                    storeData ||
                    ({
                      id: record.store_id,
                      name: record.store_id,
                    } as UserStore),
                };
              }
              return {
                ...record,
                store: { id: "unknown", name: "Unknown Store" } as UserStore,
              };
            })
          );

          setPriceRecords(recordsWithStoreInfo);
        } catch (error) {
          console.error("Error processing price records:", error);
        }
      },
      (error) => {
        console.error("Error listening to price records:", error);
      }
    );

    return () => unsubscribe();
  }, [userProductId]);

  // Helper function to format date
  const formatDateTime = (dateValue: any) => {
    let date;

    if (dateValue && typeof dateValue.toDate === "function") {
      date = dateValue.toDate();
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === "string") {
      date = new Date(dateValue);
    } else {
      // Fallback for unexpected formats
      console.warn("Unexpected date format:", dateValue);
      return "Invalid date";
    }

    // Format date: May 10, 2025
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // Format time: 10:00
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return `${formattedDate} at ${formattedTime}`;
  };

  if (loading) {
    return <LoadingLogo />;
  }

  return (
    <View style={styles.container}>
      {/* Product Information */}
      <TouchableOpacity
        style={[styles.section]}
        onPress={() =>
          navigation.navigate("EditProduct", { productId: productId })
        }
      >
        <View style={styles.basicInfoContainer}>
          <ProductImage
            imageType={product?.image_type}
            imageSource={product?.image_source}
          />
          <View style={styles.contentContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.sectionTitle}>{product?.name}</Text>
              <View style={styles.categoryContainer}>
                <Text style={styles.category}>{product?.category}</Text>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceValue}>
                ${productStats?.average_price.toFixed(2)}
              </Text>
              <Text style={styles.priceUnit}>/lb</Text>
              <Text style={styles.priceLabel}>Average</Text>
            </View>
          </View>
        </View>
        <View style={styles.priceRangeSection}>
          <View style={styles.priceRangeContainer}>
            <View style={styles.priceRangeBar}>
              <LinearGradient
                colors={["#4CAF50", "#FFC107", "#F44336"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
              />
            </View>
            <View style={styles.priceRangeLabels}>
              <Text style={[styles.minMaxPrice, { color: "#4CAF50" }]}>
                ${productStats?.lowest_price.toFixed(2)}
              </Text>
              <Text style={[styles.minMaxPrice, { color: "#F44336" }]}>
                ${productStats?.highest_price.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Price Records */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Price Records ({priceRecords.length})
        </Text>
        {priceRecords.length > 0 ? (
          <ScrollView style={styles.recordsContainer}>
            {priceRecords.map((record, index) => (
              <TouchableOpacity
                key={record.id}
                style={styles.recordItem}
                onPress={() =>
                  navigation.navigate("PriceRecordInformation", {
                    recordId: record.id,
                  })
                }
              >
                <View style={styles.recordLeftSection}>
                  <View style={styles.storeCircle} />
                  <View style={styles.recordInfo}>
                    <Text style={styles.storeName}>
                      {record.store?.name || "Unknown Store"}
                    </Text>
                    <Text style={styles.recordDate}>
                      {formatDateTime(record.recorded_at)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.recordPrice}>
                  ${record.price.toFixed(2)}/{record.unit_type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Text>No price records available</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.lightGray2,
  },
  section: {
    marginBottom: 24,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
  },
  basicInfoContainer: {
    flexDirection: "row",
  },
  contentContainer: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 15,
  },
  categoryContainer: {
    backgroundColor: colors.primary,
    padding: 5,
    borderRadius: 10,
  },
  category: {
    fontSize: 14,
    color: colors.white,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  priceLabel: {
    flex: 1,
    textAlign: "right",
    marginRight: 10,
    fontSize: 14,
    color: colors.secondaryText,
  },
  priceValue: {
    fontSize: 25,
    fontWeight: "bold",
    color: colors.primary,
    marginRight: 10,
  },
  priceUnit: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  priceRangeSection: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
  },
  priceRangeContainer: {
    marginTop: 12,
  },
  priceRangeBar: {
    height: 6,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: colors.lightGray2,
  },
  gradient: {
    flex: 1,
    height: "100%",
  },
  priceRangeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  minMaxPrice: {
    fontSize: 12,
    fontWeight: "400",
  },
  recordsContainer: {
    maxHeight: 300,
  },
  recordItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray2,
  },
  recordLeftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  storeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray2,
    marginRight: 12,
  },
  recordInfo: {
    justifyContent: "center",
  },
  storeName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.darkText,
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  recordPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
});

export default ProductDetailScreen;
