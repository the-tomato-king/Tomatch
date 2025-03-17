import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";
import { styles } from "../theme/styles";
import ProductCard from "../components/ProductCard";
import { mockProducts } from "../data/mockData";

const HomeScreen = () => {
  return (
    <View>
      <View style={styles.container}>
        <FlatList
          style={styles.list}
          data={mockProducts}
          keyExtractor={(item) => item.product_id}
          renderItem={({ item }) => <ProductCard product={item} />}
          ListEmptyComponent={<Text>No products found</Text>}
          ListHeaderComponent={<Text style={styles.title}>All Products</Text>}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </View>
  );
};

export default HomeScreen;
