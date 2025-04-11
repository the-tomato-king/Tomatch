import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../types/navigation";
import { COLLECTIONS } from "../../constants/firebase";
import {
  readOneDoc,
  readAllDocs,
} from "../../services/firebase/firebaseHelper";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import {
  Product,
  PriceRecord,
  UserProduct,
  UserStore,
  ImageType,
} from "../../types";
import LoadingLogo from "../../components/loading/LoadingLogo";
import ProductImage from "../../components/ProductImage";
import { colors } from "../../theme/colors";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { formatRecordDateTime } from "../../utils/dateUtils";
import {
  listenToUserProduct,
  updateUserProductDisplayPreference,
} from "../../services/userProductService";
import { UNITS } from "../../constants/units";
import { useUserPreference } from "../../hooks/useUserPreference";
import { PriceDisplay } from "../../components/PriceDisplay";

type ProductDetailRouteProp = RouteProp<HomeStackParamList, "ProductDetail">;
type ProductDetailScreenNavigationProp =
  NativeStackNavigationProp<HomeStackParamList>;

const PriceToggle = ({
  showMeasurablePrice,
  onToggle,
  hasMeasurable,
  hasCount,
}: {
  showMeasurablePrice: boolean;
  onToggle: () => void;
  hasMeasurable: boolean;
  hasCount: boolean;
}) => {
  if (!hasMeasurable || !hasCount) return null;

  return (
    <TouchableOpacity style={styles.toggleButton} onPress={onToggle}>
      <Text style={styles.toggleText}>
        {showMeasurablePrice ? "Show Unit Price" : "Show Weight Price"}
      </Text>
    </TouchableOpacity>
  );
};

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const { productId, userProductId } = route.params;
  const navigation = useNavigation<ProductDetailScreenNavigationProp>();
  const { userId } = useAuth();
  const { preferences } = useUserPreference(userId!);

  const [loading, setLoading] = useState(true);
  const [userProduct, setUserProduct] = useState<UserProduct | null>(null);
  const [priceRecords, setPriceRecords] = useState<PriceRecord[]>([]);
  const [productExists, setProductExists] = useState(true);
  const [showMeasurablePrice, setShowMeasurablePrice] = useState<boolean>(
    () => {
      return userProduct?.display_preference !== "count";
    }
  );

  useEffect(() => {
    const unsubscribe = listenToUserProduct(
      userId!,
      userProductId,
      ({ userProduct, productExists, error }) => {
        setUserProduct(userProduct);
        setProductExists(productExists);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, userProductId]);

  useEffect(() => {
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
  }, [userId, userProductId]);

  useEffect(() => {
    if (userProduct?.display_preference) {
      setShowMeasurablePrice(userProduct.display_preference === "measurable");
    }
  }, [userProduct?.display_preference]);

  const handleToggleDisplay = async () => {
    const newValue = !showMeasurablePrice;
    setShowMeasurablePrice(newValue);

    if (userId && userProductId) {
      await updateUserProductDisplayPreference(
        userId,
        userProductId,
        newValue ? "measurable" : "count"
      );
    }
  };

  if (loading) {
    return <LoadingLogo />;
  }

  if (!productExists) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={50}
          color={colors.negative}
        />
        <Text style={styles.notFoundTitle}>Product Not Found</Text>
        <Text style={styles.notFoundText}>
          This product may have been deleted or is no longer available.
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => navigation.navigate("HomeScreen")}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!userProduct) {
    return <LoadingLogo />;
  }

  const hasMeasurable = userProduct.measurement_types.includes("measurable");
  const hasCount = userProduct.measurement_types.includes("count");
  const canToggle = hasMeasurable && hasCount;

  return (
    <View style={styles.container}>
      {/* Product Information */}
      <TouchableOpacity
        style={[styles.section]}
        onPress={() =>
          navigation.navigate("EditProduct", { productId: userProductId })
        }
      >
        <View style={styles.basicInfoContainer}>
          <ProductImage
            imageType={userProduct.image_type as ImageType}
            imageSource={userProduct.image_source as string}
          />
          <View style={styles.contentContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.sectionTitle}>{userProduct.name}</Text>
              <View style={styles.categoryContainer}>
                <Text style={styles.category}>{userProduct.category}</Text>
              </View>
            </View>
            <View style={styles.priceSection}>
              <View style={styles.priceDisplay}>
                <PriceDisplay
                  standardPrice={
                    showMeasurablePrice
                      ? userProduct?.price_statistics?.measurable
                          ?.average_price || 0
                      : userProduct?.price_statistics?.count?.average_price || 0
                  }
                  style={styles.priceValue}
                  measurementType={userProduct.display_preference}
                />
                <Text style={styles.priceUnit}>
                  /{showMeasurablePrice ? preferences?.unit || "kg" : "ea"}
                </Text>
              </View>
              {canToggle && (
                <View style={styles.priceHeader}>
                  <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={handleToggleDisplay}
                  >
                    <Text style={styles.toggleText}>
                      {showMeasurablePrice
                        ? "Show Unit Price"
                        : "Show Weight Price"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
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
              {userProduct.display_preference === "count" ? (
                <>
                  <PriceDisplay
                    standardPrice={
                      userProduct?.price_statistics?.count?.lowest_price
                    }
                    style={[styles.minMaxPrice, { color: "#4CAF50" }]}
                  />
                  <PriceDisplay
                    standardPrice={
                      userProduct?.price_statistics?.count?.highest_price
                    }
                    style={[styles.minMaxPrice, { color: "#F44336" }]}
                  />
                </>
              ) : (
                <>
                  <PriceDisplay
                    standardPrice={
                      userProduct?.price_statistics?.measurable?.lowest_price
                    }
                    style={[styles.minMaxPrice, { color: "#4CAF50" }]}
                  />
                  <PriceDisplay
                    standardPrice={
                      userProduct?.price_statistics?.measurable?.highest_price
                    }
                    style={[styles.minMaxPrice, { color: "#F44336" }]}
                  />
                </>
              )}
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
                      {formatRecordDateTime(record.recorded_at)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.recordPrice}>
                  ${parseFloat(record.original_price).toFixed(2)}/$
                  {record.original_unit}
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
  priceSection: {
    marginTop: 16,
  },
  priceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  priceTitle: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  toggleButton: {
    backgroundColor: colors.lightGray2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toggleText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "500",
  },
  priceDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currencySymbol: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: "600",
  },
  priceValue: {
    fontSize: 32,
    color: colors.primary,
    fontWeight: "bold",
    marginLeft: 2,
  },
  priceUnit: {
    fontSize: 16,
    color: colors.secondaryText,
    marginLeft: 4,
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
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: colors.darkText,
  },
  notFoundText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: colors.secondaryText,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  backButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ProductDetailScreen;
