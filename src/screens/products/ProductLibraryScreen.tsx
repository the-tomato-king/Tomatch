import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { PRODUCTS, PRODUCT_CATEGORIES } from "../../data/Product";
import { colors } from "../../theme/colors";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import ProductImage from "../../components/ProductImage";
import CategoryFilter from "../../components/CategoryFilter";
import SearchBar from "../../components/SearchBar";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { Product } from "../../types";
import LoadingLogo from "../../components/LoadingLogo";
import { COLLECTIONS } from "../../constants/firebase";
import {
  getAllProducts,
  filterProductsByCategory,
} from "../../services/productService";

type ProductLibraryRouteProp = NativeStackScreenProps<
  RootStackParamList,
  "ProductLibrary"
>["route"];

const ProductLibraryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<ProductLibraryRouteProp>();
  const initialSearchText = route.params?.initialSearchText || "";

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState(initialSearchText);

  useEffect(() => {
    const allProducts = getAllProducts();
    setProducts(allProducts);
    setLoading(false);
  }, []);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const filteredProducts = products
    .filter(
      (product) =>
        selectedCategory === "all" || product.category === selectedCategory
    )
    .filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleProductSelect = (product: (typeof PRODUCTS)[0]) => {
    if (route.params?.onSelectProduct) {
      route.params.onSelectProduct({ ...product, id: product.name });
    }
    navigation.goBack();
  };

  if (loading) {
    return <LoadingLogo />;
  }

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
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleProductSelect(item)}>
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
              </TouchableOpacity>
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
    flex: 1,
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
    flex: 1,
    marginTop: 20,
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 10,
  },
  // product list
  productListContainer: {
    flex: 1,
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
