import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Image,
} from "react-native";
import React from "react";
import { PRODUCTS } from "../data/Product";
import { globalStyles } from "../theme/styles";
import { colors } from "../theme/colors";

const ProductLibraryScreen = () => {
  return (
    <View style={styles.container}>
      {/* todo: add search bar */}
      <View style={styles.searchBarContainer}>
        <TextInput placeholder="Search" />
      </View>
      {/* todo: add category filter */}
      <View style={styles.categoryFilterContainer}>
        <Text>Category</Text>
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
  searchBarContainer: {
    marginTop: 20,
    width: "100%",
    height: 40,
    backgroundColor: "pink",
  },
  categoryFilterContainer: {
    marginTop: 20,
    width: "100%",
    height: 40,
    backgroundColor: "teal",
  },
  productListContainer: {
    marginTop: 20,
    width: "100%",
    height: "100%",
    backgroundColor: colors.lightGray,
    borderRadius: 10,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: "#E0E0E0",
    borderRadius: 40,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  emojiText: {
    fontSize: 50,
    textAlign: "center",
  },
  productInfo: {
    flexDirection: "column",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  productCategory: {
    fontSize: 14,
    color: colors.secondaryText,
  },
});
