import React, { useState } from "react";
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  Modal,
} from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";

interface ImagePreviewProps {
  source?: string | null;
  containerStyle?: StyleProp<ViewStyle>;
  height?: number;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  source,
  containerStyle,
  height = 180,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!source) return null;

  return (
    <>
      <TouchableOpacity
        style={[styles.container, { height }, containerStyle]}
        onPress={() => setIsVisible(true)}
      >
        <Image
          source={{ uri: source }}
          style={styles.image}
          resizeMode="cover"
        />
      </TouchableOpacity>

      <Modal visible={isVisible} transparent={true}>
        <ImageViewer
          imageUrls={[{ url: source }]}
          enableSwipeDown={true}
          onSwipeDown={() => setIsVisible(false)}
          onClick={() => setIsVisible(false)}
          swipeDownThreshold={50}
          backgroundColor="black"
          renderIndicator={() => <></>}
          renderHeader={() => <></>}
          renderFooter={() => <></>}
          enableImageZoom={true}
          saveToLocalByLongPress={false}
          menus={() => <></>}
        />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

export default ImagePreview;
