import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
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
    padding: 16,
    backgroundColor: colors.ios.secondarySystemGroupedBackground,
    borderRadius: 10,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  text: {
    fontSize: 17,
    color: colors.ios.label,
    flex: 1,
  },
});

export default LocationSelector;
