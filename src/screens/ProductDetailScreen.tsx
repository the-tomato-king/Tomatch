import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { HomeStackParamList } from "../types/navigation";
import { COLLECTIONS } from "../constants/firebase";
import { readOneDoc, readAllDocs } from "../services/firebase/firebaseHelper";
import { Product, PriceRecord, UserProductStats } from "../types";
import LoadingLogo from "../components/loadingLogo";
import ProductImage from "../components/ProductImage";
import { colors } from "../theme/colors";
import { LinearGradient } from "expo-linear-gradient";

type ProductDetailRouteProp = RouteProp<HomeStackParamList, "ProductDetail">;

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const { productId, userProductId } = route.params;

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
        console.log("Fetching data for product:", productId);
        console.log("User product ID:", userProductId);

        // get product details
        const productData = await readOneDoc<Product>(
          COLLECTIONS.PRODUCTS,
          productId
        );
        setProduct(productData);
        console.log("Product data:", productData);

        // get user product stats
        const userId = "user123"; // TODO: get user id from auth
        const statsPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCT_STATS}`;
        const statsData = await readOneDoc<UserProductStats>(
          statsPath,
          productId
        );
        setProductStats(statsData);

        // get price records
        const recordsPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.PRICE_RECORDS}`;
        const records = await readAllDocs<PriceRecord>(recordsPath);

        console.log("All records:", records);
        console.log("User product ID:", userProductId);
        // filter records belong to current product
        const filteredRecords = records.filter(
          (record) => record.user_product_id === userProductId
        );
        console.log("Filtered records:", filteredRecords);

        // sort by date, latest first
        filteredRecords.sort((a, b) => {
          return (
            new Date(b.recorded_at).getTime() -
            new Date(a.recorded_at).getTime()
          );
        });

        setPriceRecords(filteredRecords);
        console.log("Price records:", filteredRecords);
      } catch (error) {
        console.error("Error fetching product data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId, userProductId]);

  if (loading) {
    return <LoadingLogo />;
  }

  return (
    <View style={styles.container}>
      {/* Product Information */}
      <View style={[styles.section]}>
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
              <Text style={styles.priceLabel}>Average</Text>
            </View>
          </View>
        </View>
        <View style={styles.priceRangeSection}>
          <Text style={styles.sectionTitle}>Price Range</Text>
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
              <Text style={styles.minPrice}>
                ${productStats?.lowest_price.toFixed(2)}/lb
              </Text>
              <Text style={styles.maxPrice}>
                ${productStats?.highest_price.toFixed(2)}/lb
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Price Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price Statistics</Text>
        {productStats ? (
          <>
            <Text>Average Price: ${productStats.average_price.toFixed(2)}</Text>
            <Text>Lowest Price: ${productStats.lowest_price.toFixed(2)}</Text>
            <Text>Highest Price: ${productStats.highest_price.toFixed(2)}</Text>
            <Text>Total Records: {productStats.total_price_records}</Text>
          </>
        ) : (
          <Text>No statistics available</Text>
        )}
      </View>

      {/* Price Records */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Price Records ({priceRecords.length})
        </Text>
        {priceRecords.length > 0 ? (
          priceRecords.map((record, index) => (
            <View key={index} style={styles.recordItem}>
              <Text>Price: ${record.price.toFixed(2)}</Text>
              <Text>Store: {record.store_id}</Text>
              <Text>
                Date: {new Date(record.recorded_at).toLocaleDateString()}
              </Text>
            </View>
          ))
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
    fontSize: 14,
    color: colors.secondaryText,
  },
  priceValue: {
    fontSize: 25,
    fontWeight: "bold",
    color: colors.primary,
    marginRight: 10,
  },
  priceRangeSection: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  priceRangeContainer: {
    marginTop: 12,
  },
  priceRangeBar: {
    height: 8,
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
  minPrice: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
  },
  maxPrice: {
    fontSize: 14,
    color: "#F44336",
    fontWeight: "500",
  },
  recordItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 8,
  },
});

export default ProductDetailScreen;
