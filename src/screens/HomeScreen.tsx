import { FlatList, StyleSheet, Text, View, Image, SafeAreaView } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import ProductCard from "../components/ProductCard";
import { UserProduct } from "../types";
import { COLLECTIONS } from "../constants/firebase";
import { readAllDocs } from "../services/firebase/firebaseHelper";
import LoadingLogo from "../components/LoadingLogo";
import { colors } from "../theme/colors";
import { useFocusEffect } from "@react-navigation/native";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";
import MainPageHeader from "../components/MainPageHeader";
const HomeScreen = () => {
  const [userProducts, setUserProducts] = useState<UserProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const currentUser = "user123";
      const collectionPath = `${COLLECTIONS.USERS}/${currentUser}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;

      // Create subscription to real-time updates
      const unsubscribe = onSnapshot(
        collection(db, collectionPath),
        (snapshot) => {
          const products = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          })) as UserProduct[];
          setUserProducts(products);
          setLoading(false);
        },
        (error) => {
          console.error("Error listening to user products:", error);
          setLoading(false);
        }
      );

      // Cleanup subscription on unmount
      return () => unsubscribe();
    }, [])
  );

  if (loading) {
    return <LoadingLogo />;
  }

  return (

    <SafeAreaView style={styles.container}>
      <MainPageHeader title="All Products" />
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
});

export default HomeScreen;
