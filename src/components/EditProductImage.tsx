import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React from "react";
import { colors } from "../theme/colors";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { ImageType } from "../types/index";

interface EditProductImageProps {
  imageType?: ImageType;
  imageSource?: string;
  userId: string;
  onPress?: () => void;
}

const EditProductImage = ({
  imageType,
  imageSource,
  userId,
  onPress,
}: EditProductImageProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageWrapper}>
        {imageType === "emoji" ? (
          <Text style={styles.emojiText}>{imageSource}</Text>
        ) : imageSource ? (
          <Image source={{ uri: imageSource }} style={styles.image} />
        ) : (
          <View style={styles.placeholderContainer}>
            <MaterialCommunityIcons
              name="camera-plus-outline"
              size={40}
              color={colors.mediumGray}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    alignItems: "center",
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.lightGray2,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  emojiText: {
    fontSize: 50,
  },
  placeholderContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EditProductImage;
