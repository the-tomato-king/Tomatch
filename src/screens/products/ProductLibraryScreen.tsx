import { StyleSheet, Text, View, FlatList } from "react-native";
import React, { useState } from "react";
import { PRODUCTS, PRODUCT_CATEGORIES } from "../../data/Product";
import { colors } from "../../theme/colors";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import ProductImage from "../../components/ProductImage";
import CategoryFilter from "../../components/CategoryFilter";
import SearchBar from "../../components/SearchBar";

const ProductLibraryScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const filteredProducts = PRODUCTS.filter(
    (product) =>
      selectedCategory === "all" || product.category === selectedCategory
  ).filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.sortByContainer}>
          <MaterialCommunityIcons
            name="sort"
            size={24}
            color={colors.darkGray}
          />
        </View>
        <View style={{ flex: 1 }}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products"
          />
        </View>
      </View>
      <View style={styles.productLibraryContainer}>
        <CategoryFilter
          categories={Object.values(PRODUCT_CATEGORIES)}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
        <View style={styles.productListContainer}>
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <View style={styles.productItem}>
                <ProductImage
                  imageType={item.image_type}
                  imageSource={item.image_source}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productCategory}>{item.category}</Text>
                </View>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </View>
    </View>
  );
};

export default ProductLibraryScreen;

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
  // search header
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
  },
  sortByContainer: {
    width: 40,
    height: 40,
    backgroundColor: colors.white,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  // product library
  productLibraryContainer: {
    marginTop: 20,
    width: "100%",
    height: "100%",
    backgroundColor: colors.white,
    borderRadius: 10,
  },
  // product list
  productListContainer: {
    width: "100%",
    height: "100%",
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  productInfo: {
    flexDirection: "column",
  },
  productName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
  },
  productCategory: {
    flex: 5,
    fontSize: 14,
    color: colors.secondaryText,
  },
});
