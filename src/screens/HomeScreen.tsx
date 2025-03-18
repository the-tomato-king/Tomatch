import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";
import { globalStyles } from "../theme/styles";
import ProductCard from "../components/ProductCard";
import { mockProducts } from "../data/mockData";

const HomeScreen = () => {
  // useEffect(() => {
  //   testFirestoreConnection();
  // }, []); 
  
  return (
    <View>
      <View style={styles.container}>
        <FlatList
          data={mockProducts}
          keyExtractor={(item) => item.product_id}
          renderItem={({ item }) => <ProductCard product={item} />}
          ListEmptyComponent={<Text>No products found</Text>}
          ListHeaderComponent={<Text style={globalStyles.title}>All Products</Text>}
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
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    width: "100%",
    alignSelf: "center",
  },
});
