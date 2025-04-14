import {
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import React, { useEffect, useRef } from "react";
import { colors } from "../../theme/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface AILoadingOverlayProps {
  imageUri: string | null;
}

const AILoadingOverlay: React.FC<AILoadingOverlayProps> = ({ imageUri }) => {
  // Animation value for the scanning line
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Scanning line animation
  useEffect(() => {
    const startAnimation = () => {
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start(() => startAnimation());
    };

    startAnimation();
  }, [scanLineAnim]);

  const { height } = Dimensions.get("window");
  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height],
  });

  if (!imageUri) return null;

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <View style={StyleSheet.absoluteFill}>
        <Image source={{ uri: imageUri }} style={styles.backgroundImage} />
        <View style={styles.overlay} />
      </View>

      {/* Scanning Line */}
      <Animated.View
        style={[
          styles.scanLine,
          {
            transform: [{ translateY: scanLineTranslateY }],
          },
        ]}
      />

      {/* AI Analysis Text */}
      <View style={styles.contentContainer}>
        <MaterialCommunityIcons name="robot" size={60} color={colors.white} />
        <Text style={styles.text}>AI is analyzing your image</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primary,
    opacity: 0.8,
  },
  contentContainer: {
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    color: colors.white,
    marginTop: 10,
    textAlign: "center",
  },
});

export default AILoadingOverlay;
