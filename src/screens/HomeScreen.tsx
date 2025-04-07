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
import { readAllDocs, readOneDoc } from "../services/firebase/firebaseHelper";
import LoadingLogo from "../components/LoadingLogo";
import { colors } from "../theme/colors";
import { useFocusEffect } from "@react-navigation/native";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";
import MainPageHeader from "../components/MainPageHeader";
import SearchBar from "../components/SearchBar";

const HomeScreen = () => {
  const [userProducts, setUserProducts] = useState<UserProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [productsDetails, setProductsDetails] = useState<{
    [key: string]: Product;
  }>({});

  useEffect(() => {
    const userId = "user123"; // TODO: get user id from auth
    const userProductsPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;

    // monitor user product list change
    const unsubscribe = onSnapshot(
      collection(db, userProductsPath),
      async (snapshot) => {
        try {
          const products = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const userProduct = { id: doc.id, ...doc.data() } as UserProduct;
              // get product details
              const productData = await readOneDoc<Product>(
                COLLECTIONS.PRODUCTS,
                userProduct.product_id
              );
              return {
                ...userProduct,
                product: productData,
              };
            })
          );
          setUserProducts(products);
        } catch (error) {
          console.error("Error processing user products:", error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error listening to user products:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProductsDetails = async () => {
      const details: { [key: string]: Product } = {};
      for (const product of userProducts) {
        try {
          const productDetail = await readOneDoc<Product>(
            COLLECTIONS.PRODUCTS,
            product.product_id
          );
          if (productDetail) {
            details[product.product_id] = productDetail;
          }
        } catch (error) {
          console.error("Error fetching product details:", error);
        }
      }
      setProductsDetails(details);
    };

    if (userProducts.length > 0) {
      fetchProductsDetails();
    }
  }, [userProducts]);

  const filteredProducts = userProducts.filter((product) => {
    const productDetail = productsDetails[product.product_id];
    return productDetail?.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
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
