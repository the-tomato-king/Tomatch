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
      <Text style={styles.title}>Product Details</Text>

      {/* 显示产品基本信息 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product Information</Text>
        <Text>Name: {product?.name}</Text>
        <Text>Category: {product?.category}</Text>
      </View>

      {/* 显示产品统计信息 */}
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

      {/* 显示价格记录 */}
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
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  recordItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 8,
  },
});

export default ProductDetailScreen;
