import { Image, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { UserProduct } from "../types";
import { globalStyles } from "../theme/styles";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../types/navigation";
import { colors } from "../theme/colors";
import { readOneDoc } from "../services/firebase/firebaseHelper";
import { COLLECTIONS } from "../constants/firebase";
import ProductImage from "./ProductImage";
import { ImageType } from "../types";
type ProductNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  "HomeScreen"
>;

interface ProductCardProps {
  product: UserProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigation = useNavigation<ProductNavigationProp>();

  const handlePress = () => {
    navigation.navigate("ProductDetail", {
      productId: product.product_id || product.id,
      userProductId: product.id,
    });
  };

  // Format price
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  // Format unit
  const formatUnit = (unit: string) => {
    return `/${unit}`;
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.productItem}>
        <ProductImage
          imageType={product.image_type as ImageType}
          imageSource={product.image_source as string}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productCategory}>{product.category}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>
            {formatPrice(product.average_price)}
              <Text style={styles.unitText}>/lb</Text>
              {/* TODO: use user preferred unit */}
            </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
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
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  productCategory: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  priceContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginRight: 10,
  },
  priceText: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
  },
  unitText: {
    fontSize: 12,
    color: colors.secondaryText,
  },
});
