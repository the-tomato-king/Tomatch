import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";
import { colors } from "../theme/colors";

interface ProductImageProps {
  imageType?: string;
  imageSource?: string;
  size?: number;
}

const ProductImage = ({
  imageType,
  imageSource,
  size = 70, // 默认尺寸
}: ProductImageProps) => {
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
      fontSize: size * 0.64, // 根据容器大小调整emoji大小
    },
  });

  return (
    <View style={styles.container}>
      {imageType === "emoji" ? (
        <Text style={styles.emojiText}>{imageSource}</Text>
      ) : imageSource ? (
        <Image source={{ uri: imageSource }} style={styles.image} />
      ) : null}
    </View>
  );
};

export default ProductImage;
