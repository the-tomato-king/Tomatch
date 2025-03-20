import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { PRODUCTS, PRODUCT_CATEGORIES } from "../data/Product";
import { globalStyles } from "../theme/styles";
import { colors } from "../theme/colors";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const ProductLibraryScreen = () => {
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
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons
              name="magnify"
              size={24}
              color={colors.darkGray}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor={colors.darkGray}
            />
          </View>
        </View>
      </View>
      <View style={styles.productLibraryContainer}>
        <View style={styles.categoryFilterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>All</Text>
            </TouchableOpacity>
            {Object.values(PRODUCT_CATEGORIES).map((category) => (
              <TouchableOpacity key={category} style={styles.categoryButton}>
                <Text style={styles.categoryButtonText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.productListContainer}>
          <FlatList
            data={PRODUCTS}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <View style={styles.productItem}>
                <View style={styles.productImagePlaceholder}>
                  {item.image_type === "emoji" ? (
                    <Text style={styles.emojiText}>{item.image_source}</Text>
                  ) : item.image_source ? (
                    <Image
                      source={{ uri: item.image_source }}
                      style={styles.productImage}
                    />
                  ) : null}
                </View>
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
  // search bar
  searchBarContainer: {
    flex: 1,
    height: 40,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingVertical: 0, // 移除默认内边距
  },
  // product library
  productLibraryContainer: {
    marginTop: 20,
    width: "100%",
    height: "100%",
    backgroundColor: colors.white,
    borderRadius: 10,
  },
  // category filter
  categoryFilterContainer: {
    width: "100%",
    height: 40,
    borderBottomWidth: 2,
    borderBottomColor: colors.lightGray2,
  },
  categoryButton: {
    paddingHorizontal: 20,
    height: "100%",
    justifyContent: "center",
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: 500,
    color: colors.secondaryText,
    textAlign: "center",
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
  productImagePlaceholder: {
    width: 70,
    height: 70,
    backgroundColor: "#E0E0E0",
    borderRadius: 40,
    marginRight: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 40,
  },
  emojiText: {
    fontSize: 45,
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
