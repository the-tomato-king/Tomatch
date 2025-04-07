import { StyleSheet, Text, View, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { colors } from "../theme/colors";
import {
  getProductImage,
  uploadProductImage,
} from "../services/firebase/storageHelper";
import { ImageType } from "../types";

interface ProductImageProps {
  imageType: ImageType;
  imageSource: string;
  size?: number;
}

const ProductImage = ({
  imageType,
  imageSource,
  size = 70,
}: ProductImageProps) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 重置错误状态
    setError(null);

    // 调试日志
    console.log("ProductImage props:", {
      imageType,
      imageSource,
      size,
    });

    if (imageType === "emoji") {
      console.log("Using emoji type, skipping image load");
      return;
    }

    const defaultUserId = "user123"; // TODO: get from auth

    // 调试日志
    console.log("Attempting to load image with:", {
      imageSource,
      imageType,
      defaultUserId,
    });

    getProductImage(imageSource, imageType, defaultUserId)
      .then((url) => {
        console.log("Successfully loaded image URL:", url);
        setImageUrl(url);
      })
      .catch((error) => {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error("Detailed image loading error:", {
          error: errorMessage,
          imageType,
          imageSource,
          defaultUserId,
        });
        setError(errorMessage);
      });
  }, [imageSource, imageType]);

  const styles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      backgroundColor: colors.lightGray2,
      borderRadius: size / 2,
      marginRight: 20,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
    image: {
      width: size,
      height: size,
      borderRadius: size / 2,
    },
    emojiText: {
      fontSize: size * 0.64,
    },
    errorContainer: {
      justifyContent: "center",
      alignItems: "center",
    },
    errorText: {
      fontSize: 10,
      color: colors.negative,
      textAlign: "center",
    },
  });

  // 根据不同状态显示不同内容
  const renderContent = () => {
    if (imageType === "emoji") {
      return <Text style={styles.emojiText}>{imageSource}</Text>;
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>!</Text>
        </View>
      );
    }

    if (imageUrl) {
      return <Image source={{ uri: imageUrl }} style={styles.image} />;
    }

    return null;
  };

  return <View style={styles.container}>{renderContent()}</View>;
};

export default ProductImage;
