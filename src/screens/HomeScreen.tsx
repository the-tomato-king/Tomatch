import { FlatList, StyleSheet, Text, View, Image } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { globalStyles } from "../theme/styles";
import ProductCard from "../components/ProductCard";
import { UserProduct } from "../types";
import { collection, getDocs } from "firebase/firestore";
import { COLLECTIONS } from "../constants/firebase";
import { db } from "../services/firebase/firebaseConfig";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { readAllDocs } from "../services/firebase/firebaseHelper";
import LoadingLogo from "../components/loadingLogo";
import { colors } from "../theme/colors";

const HomeScreen = () => {
  const [userProducts, setUserProducts] = useState<UserProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserProducts = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = "user123";
      const collectionPath = `${COLLECTIONS.USERS}/${currentUser}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;
      const products = await readAllDocs<UserProduct>(collectionPath);
      console.log("User products:", products);
      setUserProducts(products);
    } catch (error) {
      console.error("Error fetching user products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserProducts();
    }, [fetchUserProducts])
  );

  useEffect(() => {
    fetchUserProducts();
  }, []);

  if (loading) {
    return <LoadingLogo />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>All Products</Text>
        <FlatList
          style={styles.list}
          data={userProducts}
          keyExtractor={(item) => item.product_id}
          renderItem={({ item }) => <ProductCard product={item} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray2,

    paddingHorizontal: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.darkText,
    marginVertical: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.white,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.darkGray,
  },
  separator: {
    height: 1,
    backgroundColor: colors.lightGray2,
    marginHorizontal: 16,
  },
});

export default HomeScreen;
