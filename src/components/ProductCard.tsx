import { Image, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { UserProduct } from "../types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../types/navigation";
import { colors } from "../theme/colors";
import ProductImage from "./ProductImage";
import { ImageType } from "../types";
import { PriceDisplay } from "./PriceDisplay";
import { useUnitDisplay } from "../hooks/useUnitDisplay";

type ProductNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  "HomeScreen"
>;

interface ProductCardProps {
  product: UserProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigation = useNavigation<ProductNavigationProp>();
  const { preferredUnit } = useUnitDisplay();

  const handlePress = () => {
    navigation.navigate("ProductDetail", {
      productId: product.product_id || product.id,
      userProductId: product.id,
    });
  };

  // show different price based on display preference
  const priceToShow =
    product.display_preference === "count"
      ? product.price_statistics.count?.average_price
      : product.price_statistics.measurable?.average_price;

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
          <View style={styles.priceWrapper}>
            {priceToShow !== undefined && (
              <>
                <PriceDisplay
                  standardPrice={priceToShow}
                  style={styles.priceText}
                  measurementType={product.display_preference}
                />
                <Text style={styles.unitText}>
                  /
                  {product.display_preference === "count"
                    ? "ea"
                    : preferredUnit}
                </Text>
              </>
            )}
          </View>
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
  priceWrapper: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceText: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
  },
  unitText: {
    fontSize: 12,
    color: colors.secondaryText,
    marginLeft: 2,
  },
});
