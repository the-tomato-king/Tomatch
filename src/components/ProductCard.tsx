import { Image, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Product, UserProduct } from "../types";
import { globalStyles } from "../theme/styles";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../types/navigation";
import { colors } from "../theme/colors";
import { readOneDoc } from "../services/firebase/firebaseHelper";
import { COLLECTIONS } from "../constants/firebase";

type ProductNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  "HomeScreen"
>;

interface ProductCardProps {
  product: UserProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigation = useNavigation<ProductNavigationProp>();
  const [productDetails, setProductDetails] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const details = await readOneDoc<Product>(
          COLLECTIONS.PRODUCTS,
          product.product_id
        );
        if (details) {
          setProductDetails(details);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };

    fetchProductDetails();
  }, [product.product_id]);

  const handlePress = () => {
    navigation.navigate("ProductDetail", {
      productId: product.product_id,
    });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.productItem}>
        <View style={styles.productImagePlaceholder}>
          {productDetails?.image_type === "emoji" ? (
            <Text style={styles.emojiText}>{productDetails.image_source}</Text>
          ) : productDetails?.image_source ? (
            <Image
              source={{ uri: productDetails.image_source }}
              style={styles.productImage}
            />
          ) : null}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{productDetails?.name}</Text>
          <Text style={styles.productCategory}>{productDetails?.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
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
