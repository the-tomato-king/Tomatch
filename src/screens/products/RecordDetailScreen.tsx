import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { HomeStackParamList } from "../../types/navigation";
import { PriceRecord, Product, UserProduct, UserStore } from "../../types";
import { COLLECTIONS } from "../../constants/firebase";
import {
  readOneDoc,
  updateOneDocInDB,
  deleteOneDocFromDB,
} from "../../services/firebase/firebaseHelper";
import LoadingLogo from "../../components/LoadingLogo";
import { globalStyles } from "../../theme/styles";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { UserProductStats, BaseUserProductStats } from "../../types";

type PriceRecordInformationRouteProp = RouteProp<
  HomeStackParamList,
  "PriceRecordInformation"
>;

type RecordDetailScreenNavigationProp =
  NativeStackNavigationProp<HomeStackParamList>;

const PriceRecordInformationScreen = () => {
  const navigation = useNavigation<RecordDetailScreenNavigationProp>();
  const route = useRoute<PriceRecordInformationRouteProp>();
  const { recordId } = route.params;

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<PriceRecord>();
  const [product, setProduct] = useState<Product | null>(null);
  const [store, setStore] = useState<UserStore | null>(null);

  useEffect(() => {
    const userId = "user123"; // TODO: get user id from auth
    const recordPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.PRICE_RECORDS}`;

    // Create listener for the record
    const unsubscribeRecord = onSnapshot(
      doc(db, recordPath, recordId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const recordData = docSnapshot.data() as PriceRecord;
          setRecord(recordData);
          setLoading(false);
        } else {
          alert("Record not found");
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error listening to record:", error);
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribeRecord();
  }, [recordId]);

  // Separate useEffect for product
  useEffect(() => {
    if (!record?.user_product_id) return;

    const userId = "user123"; // TODO: get user id from auth
    const userProductPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;

    const unsubscribeProduct = onSnapshot(
      doc(db, userProductPath, record.user_product_id),
      async (userProductSnapshot) => {
        if (userProductSnapshot.exists()) {
          const userProductData = userProductSnapshot.data() as UserProduct;
          if (userProductData.product_id) {
            // Get product data
            const unsubscribeProductDetails = onSnapshot(
              doc(db, COLLECTIONS.PRODUCTS, userProductData.product_id),
              (productSnapshot) => {
                if (productSnapshot.exists()) {
                  setProduct(productSnapshot.data() as Product);
                }
              }
            );
            return () => unsubscribeProductDetails();
          }
        }
      }
    );

    return () => unsubscribeProduct();
  }, [record?.user_product_id]);

  // Separate useEffect for store
  useEffect(() => {
    if (!record?.store_id) return;

    const userId = "user123"; // TODO: get user id from auth
    const storePath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_STORES}`;

    const unsubscribeStore = onSnapshot(
      doc(db, storePath, record.store_id),
      (storeSnapshot) => {
        if (storeSnapshot.exists()) {
          setStore(storeSnapshot.data() as UserStore);
        } else {
          alert("Store not found");
          setStore(null);
        }
      }
    );

    return () => unsubscribeStore();
  }, [record?.store_id]);

  const formatDateTime = (dateValue: any) => {
    let date;

    if (dateValue && typeof dateValue.toDate === "function") {
      date = dateValue.toDate();
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === "string") {
      date = new Date(dateValue);
    } else {
      console.warn("Unexpected date format:", dateValue);
      return "Invalid date";
    }

    const formattedDate = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return `${formattedDate} at ${formattedTime}`;
  };

  const handleDeleteRecord = async () => {
    try {
      if (!record) {
        console.error("Record not found");
        return;
      }

      Alert.alert(
        "Delete Record",
        "Are you sure you want to delete this price record?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              const userId = "user123"; // TODO: get user id from auth

              try {
                // 1. Get product stats
                const userProductPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;
                const userProduct = await readOneDoc<UserProduct>(
                  userProductPath,
                  record.user_product_id
                );

                if (!userProduct) {
                  console.error("User product not found");
                  return;
                }

                const userProductStatsPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCT_STATS}`;
                const stats = await readOneDoc<UserProductStats>(
                  userProductStatsPath,
                  userProduct.product_id
                );

                if (!stats) {
                  console.error("Product stats not found");
                  return;
                }

                const newTotalRecords = stats.total_price_records - 1;
                const newTotalPrice = stats.total_price - record.price;

                // 2. If this is the last record
                if (newTotalRecords === 0) {
                  // Delete product stats
                  await deleteOneDocFromDB(
                    userProductStatsPath,
                    userProduct.product_id
                  );

                  // Delete user product
                  const userProductPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;
                  await deleteOneDocFromDB(
                    userProductPath,
                    record.user_product_id
                  );
                } else {
                  // 3. Update product stats
                  // Get all remaining records to recalculate min/max
                  const recordsPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.PRICE_RECORDS}`;
                  const recordsQuery = query(
                    collection(db, recordsPath),
                    where("user_product_id", "==", record.user_product_id)
                  );
                  const recordsSnapshot = await getDocs(recordsQuery);

                  let lowestPrice = Infinity;
                  let highestPrice = -Infinity;
                  let lowestPriceStore = stats.lowest_price_store;

                  recordsSnapshot.docs.forEach((doc) => {
                    const recordData = doc.data();
                    if (doc.id !== recordId) {
                      // Skip current record
                      if (recordData.price < lowestPrice) {
                        lowestPrice = recordData.price;
                        lowestPriceStore = {
                          store_id: recordData.store_id,
                          store_name: store?.name || "",
                        };
                      }
                      if (recordData.price > highestPrice) {
                        highestPrice = recordData.price;
                      }
                    }
                  });

                  const updatedStats: BaseUserProductStats = {
                    ...stats,
                    total_price: newTotalPrice,
                    average_price: newTotalPrice / newTotalRecords,
                    lowest_price: lowestPrice,
                    highest_price: highestPrice,
                    lowest_price_store: lowestPriceStore,
                    total_price_records: newTotalRecords,
                    last_updated: new Date(),
                  };

                  await updateOneDocInDB(
                    userProductStatsPath,
                    userProduct.product_id,
                    updatedStats
                  );
                }

                // 4. Delete the price record
                const recordPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.PRICE_RECORDS}`;
                const success = await deleteOneDocFromDB(recordPath, recordId);

                if (success) {
                  navigation.goBack();
                } else {
                  Alert.alert(
                    "Error",
                    "Failed to delete the record. Please try again."
                  );
                }
              } catch (error) {
                console.error("Error during delete operation:", error);
                Alert.alert(
                  "Error",
                  "An error occurred while deleting the record."
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error deleting record:", error);
      Alert.alert("Error", "An error occurred while deleting the record.");
    }
  };

  if (loading) {
    return <LoadingLogo />;
  }

  if (!record) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Record not found</Text>
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
        <Text style={styles.headerTitle}>{product?.name || "Product"}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Product Price Card */}
        <View style={styles.productPriceCard}>
          <View style={styles.productDetails}>
            <View style={styles.priceValueContainer}>
              <Text style={styles.priceValue}>
                ${record.price.toFixed(2)}/{record.unit_type}
              </Text>
            </View>
          </View>
          {/* Original Price and Record Date */}
          <View style={styles.additionalInfo}>
            <Text style={styles.originalPrice}>
              Original: ${record.unit_price.toFixed(2)}/{record.unit_type}
            </Text>
            <Text style={styles.recordDate}>
              Record on: {formatDateTime(record.recorded_at)}
            </Text>
          </View>
        </View>

        {/* Store Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Store</Text>
          <View style={styles.storeInfoCard}>
            <View style={styles.storeCircle} />
            <View style={styles.storeDetails}>
              <Text style={styles.storeName}>{store?.name || "Store"}</Text>
              {/* TODO: get address from store */}
              <Text style={styles.storeAddress}>{store?.address}</Text>
              <Text style={styles.storeAddress}>Vancouver, BC, V6T 1Z7</Text>
            </View>
          </View>
        </View>

        {/* Photo */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Photo</Text>
          {record.photo_url ? (
            <View style={styles.photoContainer}>
              <Image
                source={{ uri: record.photo_url }}
                style={styles.recordPhoto}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={styles.noPhotoContainer}>
              <Text style={styles.noPhotoText}>No photo available</Text>
            </View>
          )}
        </View>
      </ScrollView>
      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <View style={[globalStyles.buttonsContainer, { marginBottom: 20 }]}>
          <TouchableOpacity
            style={[globalStyles.button, globalStyles.primaryButton]}
            onPress={handleDeleteRecord}
          >
            <Text style={globalStyles.primaryButtonText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[globalStyles.button, globalStyles.primaryButton]}
            onPress={() =>
              navigation.navigate("EditPriceRecord", { recordId: recordId })
            }
          >
            <Text style={globalStyles.primaryButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "500",
  },
  placeholder: {
    width: 46,
  },
  scrollContainer: {
    flex: 1,
  },
  productPriceCard: {
    backgroundColor: colors.white,
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceValueContainer: {
    // maxWidth: "40%",
  },
  priceValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 16,
  },
  additionalInfo: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGray2,
    paddingTop: 12,
  },
  originalPrice: {
    fontSize: 16,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 16,
    color: colors.secondaryText,
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: colors.darkText,
  },
  storeInfoCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.lightGray2,
    marginRight: 16,
  },
  storeDetails: {
    flex: 1,
    justifyContent: "center",
  },
  storeName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 20,
  },
  photoContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
  },
  recordPhoto: {
    width: "100%",
    height: 200,
  },
  photoActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
  },
  photoButton: {
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  noPhotoContainer: {
    height: 200,
    backgroundColor: colors.lightGray2,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  noPhotoText: {
    fontSize: 16,
    color: colors.secondaryText,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  buttonsContainer: {
    marginHorizontal: 16,
  },
});

export default PriceRecordInformationScreen;
