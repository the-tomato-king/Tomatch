import { Image, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Product, UserProduct, UserProductStats } from "../types";
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
  const [productStats, setProductStats] = useState<UserProductStats | null>(
    null
  );

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

    const fetchProductStats = async () => {
      try {
        // TODO:
        const userId = "user123";
        const statsPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCT_STATS}`;

        const stats = await readOneDoc<UserProductStats>(
          statsPath,
          product.product_id
        );

        if (stats) {
          setProductStats(stats);
        }
      } catch (error) {
        console.error("Error fetching product stats:", error);
      }
    };

    fetchProductDetails();
    fetchProductStats();
  }, [product.product_id]);

  const handlePress = () => {
    navigation.navigate("ProductDetail", {
      productId: product.product_id,
    });
  };

  // 格式化价格显示
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  // 格式化单位显示
  const formatUnit = (unit: string) => {
    return `/${unit}`;
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
        {productStats && (
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>
              {formatPrice(productStats.average_price)}
              <Text style={styles.unitText}>/lb</Text>
            </Text>
          </View>
        )}
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
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  unitText: {
    fontSize: 12,
    color: colors.secondaryText,
  },
});
