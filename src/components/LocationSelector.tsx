import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { colors } from "../theme/colors";

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
  const getCurrentLocation = async () => {
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

      // Get address from coordinates
      const [addressResult] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const formattedAddress = `${addressResult.street}, ${addressResult.city}`;

      onLocationSelect({
        latitude,
        longitude,
        address: formattedAddress,
      });
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get your location");
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={getCurrentLocation}
      disabled={isLoading}
    >
      <MaterialCommunityIcons
        name="crosshairs-gps"
        size={24}
        color={colors.primary}
      />
      <Text style={styles.text}>
        {isLoading
          ? "Getting location..."
          : address
          ? address
          : "Get Current Location"}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    gap: 8,
  },
  text: {
    fontSize: 16,
    color: colors.darkText,
    flex: 1,
  },
});

export default LocationSelector;
