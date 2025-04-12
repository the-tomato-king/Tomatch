import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { colors } from "../theme/colors";
import { useLocation } from "../contexts/LocationContext";

interface LocationSelectorProps {
  address: string | null;
  isLoading: boolean;
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  address,
  isLoading,
  onLocationSelect,
}) => {
  const { setUserLocationAndStores } = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedWidth = useRef(new Animated.Value(48)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  const animate = (expand: boolean) => {
    const targetWidth = expand ? Dimensions.get("window").width - 32 : 48;
    const targetOpacity = expand ? 1 : 0;

    Animated.parallel([
      Animated.spring(animatedWidth, {
        toValue: targetWidth,
        useNativeDriver: false,
        friction: 8,
      }),
      Animated.timing(textOpacity, {
        toValue: targetOpacity,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = async () => {
    if (isExpanded) {
      setIsExpanded(false);
      animate(false);
      return;
    }

    setIsExpanded(true);
    animate(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please enable location services to use this feature."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const [addressResult] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const formattedAddress = `${addressResult.street}, ${addressResult.city}`;

      const locationData = {
        latitude,
        longitude,
        address: formattedAddress,
      };

      await setUserLocationAndStores(locationData);
      onLocationSelect(locationData);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get your location");
      // 如果获取位置失败，收起组件
      setIsExpanded(false);
      animate(false);
    }
  };

  return (
    <Animated.View style={[styles.container, { width: animatedWidth }]}>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        disabled={isLoading}
      >
        <MaterialCommunityIcons
          name="crosshairs-gps"
          size={24}
          color={colors.primary}
          style={styles.icon}
        />
        <Animated.Text
          style={[styles.text, { opacity: textOpacity }]}
          numberOfLines={1}
        >
          {isLoading
            ? "Getting location..."
            : address
            ? address
            : "Get Current Location"}
        </Animated.Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    backgroundColor: colors.ios.secondarySystemGroupedBackground,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: "hidden",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 12,
  },
  icon: {
    width: 24,
    height: 24,
  },
  text: {
    fontSize: 16,
    color: colors.ios.label,
    flex: 1,
  },
});

export default LocationSelector;
