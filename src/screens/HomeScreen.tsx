import { FlatList, StyleSheet, Text, View } from "react-native";
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
    <View>
      <View style={styles.container}>
        {/* todo: add search bar */}
        <FlatList
          data={userProducts}
          keyExtractor={(item) => item.product_id}
          renderItem={({ item }) => <ProductCard product={item} />}
          ListEmptyComponent={<Text>No products found</Text>}
          ListHeaderComponent={
            <Text style={globalStyles.title}>All Products</Text>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    width: "100%",
    alignSelf: "center",
  },
});
