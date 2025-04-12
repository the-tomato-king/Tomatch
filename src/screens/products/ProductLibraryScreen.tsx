import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { PRODUCT_CATEGORIES } from "../../data/Product";
import { colors } from "../../theme/colors";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import ProductImage from "../../components/ProductImage";
import CategoryFilter from "../../components/CategoryFilter";
import SearchBar from "../../components/search/SearchBar";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  NativeStackScreenProps,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { Product, UserProduct } from "../../types";
import LoadingLogo from "../../components/loading/LoadingLogo";
import { COLLECTIONS } from "../../constants/firebase";
import {
  getAllProducts,
  filterProductsByCategory,
} from "../../services/productLibraryService";
import { useAuth } from "../../contexts/AuthContext";

type ProductLibraryRouteProp = NativeStackScreenProps<
  RootStackParamList,
  "ProductLibrary"
>["route"];

type ProductLibraryNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

// Create a combined type for displaying in the library
interface LibraryProduct extends Product {
  isUserProduct?: boolean;
  userProductId?: string;
}

const ProductLibraryScreen = () => {
  const navigation = useNavigation<ProductLibraryNavigationProp>();
  const route = useRoute<ProductLibraryRouteProp>();
  const initialSearchText = route.params?.initialSearchText || "";
  const { userId } = useAuth();

  const [loading, setLoading] = useState(true);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [userProducts, setUserProducts] = useState<UserProduct[]>([]);
  const [combinedProducts, setCombinedProducts] = useState<LibraryProduct[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState(initialSearchText);

  useEffect(() => {
    const allLocalProducts = getAllProducts();
    setLocalProducts(allLocalProducts);

    const userProductsPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;

    const unsubscribeUserProducts = onSnapshot(
      collection(db, userProductsPath),
      (snapshot) => {
        const products = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as UserProduct[];
        setUserProducts(products);
      },
      (error) => {
        console.error("Error listening to user products:", error);
      }
    );

    setLoading(false);

    // Cleanup function
    return () => {
      unsubscribeUserProducts();
    };
  }, [userId]);

  // Combine local and user products whenever either changes
  useEffect(() => {
    // 1. get all user added product info
    const userProductNames = new Set(
      userProducts.map((product) => product.name.toLowerCase())
    );

    const userAddedProductIds = new Set(
      userProducts
        .filter((product) => product.product_id)
        .map((product) => product.product_id)
    );

    // 2. filter local products list, remove:
    // - products added by user through product_id
    // - products with the same name as user products
    const availableLocalProducts = localProducts.filter(
      (product) =>
        !userAddedProductIds.has(product.id) &&
        !userProductNames.has(product.name.toLowerCase())
    );

    // 3. format available local products
    const formattedLocalProducts: LibraryProduct[] = availableLocalProducts.map(
      (product) => ({
        ...product,
        isUserProduct: false,
      })
    );

    // 4. format user products
    const formattedUserProducts: LibraryProduct[] = userProducts.map(
      (product) => ({
        id: product.product_id || product.id,
        name: product.name,
        category: product.category,
        image_type: product.image_type,
        image_source: product.image_source,
        plu_code: product.plu_code || "",
        barcode: product.barcode || "",
        isUserProduct: true,
        userProductId: product.id,
      })
    );

    // 5. combine and set
    setCombinedProducts([
      ...formattedLocalProducts, // local products not added by user
      ...formattedUserProducts, // all user products
    ]);
  }, [localProducts, userProducts]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const filteredProducts = combinedProducts
    .filter(
      (product) =>
        selectedCategory === "all" || product.category === selectedCategory
    )
    .filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleProductSelect = (product: LibraryProduct) => {
    if (route.params?.onSelectProduct) {
      if (product.isUserProduct) {
        // If it's a user product, pass it with the original user product ID
        const userProduct = {
          ...product,
          id: product.id,
          user_product_id: product.userProductId,
        } as unknown as Product;
        route.params.onSelectProduct(userProduct);
      } else {
        // If it's a local product, pass it as normal
        route.params.onSelectProduct({ ...product, id: product.id });
      }
    }
    navigation.goBack();
  };

  // Add long press handler for editing products
  const handleLongPress = (product: LibraryProduct) => {
    if (product.isUserProduct && product.userProductId) {
      // Navigate to edit screen for user products
      navigation.navigate("EditProduct", {
        productId: product.userProductId,
      });
    } else {
      // Show alert for library products that can't be edited
      Alert.alert(
        "Cannot Edit",
        "Library products cannot be edited. You can add this product to your list and then customize it.",
        [{ text: "OK" }]
      );
    }
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
            keyExtractor={(item) =>
              item.isUserProduct
                ? `user-${item.userProductId}`
                : `local-${item.id}`
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleProductSelect(item)}
                onLongPress={() => handleLongPress(item)}
                delayLongPress={500} // Standard long press delay
              >
                <View style={styles.productItem}>
                  <ProductImage
                    imageType={item.image_type}
                    imageSource={item.image_source}
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>
                      {item.name}
                      {item.isUserProduct && (
                        <Text style={styles.userProductTag}> (My Product)</Text>
                      )}
                    </Text>
                    <Text style={styles.productCategory}>{item.category}</Text>
                  </View>
                  {item.isUserProduct && (
                    <View style={styles.editIndicator}>
                      <MaterialCommunityIcons
                        name="gesture-tap-hold"
                        size={16}
                        color={colors.secondaryText}
                      />
                    </View>
                  )}
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
  userProductTag: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "normal",
  },
  editIndicator: {
    padding: 8,
  },
});
