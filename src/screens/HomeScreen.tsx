import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";
import { globalStyles } from "../theme/styles";
import ProductCard from "../components/ProductCard";
import { PRODUCTS } from "../data/Product";

const HomeScreen = () => {
  // useEffect(() => {
  //   testFirestoreConnection();
  // }, []);

  return (
    <View>
      <View style={styles.container}>
        {/* todo: add search bar */}
        {/* todo: use user's product instead of predefined product library */}
        <FlatList
          data={PRODUCTS}
          keyExtractor={(item) => item.name}
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
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    width: "100%",
    alignSelf: "center",
  },
});
