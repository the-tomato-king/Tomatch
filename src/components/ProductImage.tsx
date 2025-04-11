import { StyleSheet, Text, View, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { colors } from "../theme/colors";
import { getProductImage } from "../services/mediaService";
import { ImageType } from "../types";
import { useAuth } from "../contexts/AuthContext";

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
  const [loading, setLoading] = useState<boolean>(false);
  const { userId } = useAuth();
  useEffect(() => {
    // Reset state
    setImageUrl("");
    setLoading(false);

    // // For debugging only
    // console.log("ProductImage props:", {
    //   imageType,
    //   imageSource,
    //   size,
    // });

    // Handle emoji type - no need to load anything
    if (imageType === "emoji") {
      return;
    }

    // Check for valid inputs before trying to load image
    if (!imageType || !imageSource) {
      console.log(
        "Skipping image load due to missing imageType or imageSource"
      );
      return;
    }

    setLoading(true);

    getProductImage(imageSource, imageType, userId as string)
      .then((url) => {
        console.log("Successfully loaded image URL:", url);
        setImageUrl(url);
        setLoading(false);
      })
      .catch((error) => {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error("Image loading error:", {
          error: errorMessage,
          imageType,
          imageSource,
          userId,
        });
        // Don't set error state visibly to user, just log it
        setLoading(false);
      });
  }, [imageSource, imageType, userId]);

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
  });

  // Render content based on current state
  const renderContent = () => {
    if (imageType === "emoji" && imageSource) {
      return <Text style={styles.emojiText}>{imageSource}</Text>;
    }

    if (imageUrl) {
      return <Image source={{ uri: imageUrl }} style={styles.image} />;
    }

    // Default empty state - just show the background container
    // No error icon or message displayed
    return null;
  };

  return <View style={styles.container}>{renderContent()}</View>;
};

export default ProductImage;
