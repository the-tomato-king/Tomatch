import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import ProductCard from "../components/ProductCard";
import { UserProduct, Product } from "../types";
import { COLLECTIONS } from "../constants/firebase";
import LoadingLogo from "../components/loading/LoadingLogo";
import { colors } from "../theme/colors";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";
import MainPageHeader from "../components/MainPageHeader";
import SearchBar from "../components/search/SearchBar";
import {
  getAllProducts,
  getProductById,
} from "../services/productLibraryService";
import { useAuth } from "../contexts/AuthContext";

const HomeScreen = () => {
  const { userId } = useAuth();
  const [userProducts, setUserProducts] = useState<UserProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [productsDetails, setProductsDetails] = useState<{
    [key: string]: Product;
  }>({});

  useEffect(() => {
    const userProductsPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;

    // monitor user product list change
    const unsubscribeUserProducts = onSnapshot(
      collection(db, userProductsPath),
      (snapshot) => {
        const products = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as UserProduct[];
        setUserProducts(products);
      },
      (error) => {
        console.error("Error listening to user products:", error);
      }
    );

    const allProducts = getAllProducts();
    const details: { [key: string]: Product } = {};
    allProducts.forEach((product) => {
      details[product.id] = product;
    });
    setProductsDetails(details);
    setLoading(false);

    // cleanup function
    return () => {
      unsubscribeUserProducts();
    };
  }, [userId]);

  // Filter products with price records
  const productsWithStats = userProducts.filter((product) => {
    // Only keep products that have price records (total_price_records > 0)
    return product.total_price_records > 0;
  });

  // Then apply search filter
  const filteredProducts = productsWithStats.filter((product) => {
    const productDetail = productsDetails[product.product_id || ""];
    if (!productDetail) {
      // Make sure product.name exists before calling toLowerCase
      return product.name?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return productDetail.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return <LoadingLogo />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <MainPageHeader title="All Products" />
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search products"
        />
      </View>
      <FlatList
        style={styles.list}
        data={filteredProducts}
        keyExtractor={(item) => item.product_id || item.id}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray2,
  },
  list: {
    flex: 1,
    marginHorizontal: 16,
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});

export default HomeScreen;
