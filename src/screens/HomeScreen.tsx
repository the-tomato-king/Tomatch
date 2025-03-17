import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";
import { styles } from "../theme/styles";
import ProductCard from "../components/ProductCard";
import { mockProducts } from "../data/mockData";

const HomeScreen = () => {
  return (
    <View>
      <View style={styles.container}>
        <Text style={styles.title}>All Products</Text>
        <FlatList
          data={mockProducts}
          keyExtractor={(item) => item.product_id}
          renderItem={({ item }) => <Text>{item.name}</Text>}
        />
      </View>
    </View>
  );
};

export default HomeScreen;
