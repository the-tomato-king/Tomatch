import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { HomeStackParamList } from "../types/navigation";
import { PriceRecord, Product, UserProduct, UserStore } from "../types";
import { COLLECTIONS } from "../constants/firebase";
import { readOneDoc } from "../services/firebase/firebaseHelper";
import LoadingLogo from "../components/LoadingLogo";

type PriceRecordInformationRouteProp = RouteProp<
  HomeStackParamList,
  "PriceRecordInformation"
>;

const PriceRecordInformationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<PriceRecordInformationRouteProp>();
  const { recordId } = route.params;

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<PriceRecord | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [store, setStore] = useState<UserStore | null>(null);

  useEffect(() => {
    const fetchRecordData = async () => {
      try {
        setLoading(true);

        // TODO: get user id from auth
        const userId = "user123";

        const recordPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.PRICE_RECORDS}`;
        const recordData = await readOneDoc<PriceRecord>(recordPath, recordId);

        if (recordData) {
          setRecord(recordData);

          if (recordData.user_product_id) {
            const userProductPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;
            const userProductData = await readOneDoc<UserProduct>(
              userProductPath,
              recordData.user_product_id
            );

            if (userProductData && userProductData.product_id) {
              const productData = await readOneDoc<Product>(
                COLLECTIONS.PRODUCTS,
                userProductData.product_id
              );
              setProduct(productData);
            }
          }

          if (recordData.store_id) {
            const storePath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_STORES}`;
            const storeData = await readOneDoc(storePath, recordData.store_id);

            if (storeData) {
              setStore({
                id: recordData.store_id,
                name: recordData.store_id,
              } as UserStore);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching record data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecordData();
  }, [recordId]);

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
        <Text style={styles.headerTitle}>
          {store?.name || "Store"} - {product?.name || "Product"}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Product Price Card */}
        <View style={styles.productPriceCard}>
          <Text style={styles.productName}>{product?.name || "Product"}</Text>
          <Text style={styles.priceValue}>
            ${record.price.toFixed(2)}/{record.unit_type}
          </Text>

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
              <View style={styles.photoActions}>
                <TouchableOpacity style={styles.photoButton}>
                  <Text style={styles.photoButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoButton}>
                  <Text style={styles.photoButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.noPhotoContainer}>
              <Text style={styles.noPhotoText}>No photo available</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  productName: {
    fontSize: 24,
    fontWeight: "500",
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 32,
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
});

export default PriceRecordInformationScreen;
