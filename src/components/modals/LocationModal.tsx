import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { colors } from "../../theme/colors";
import { globalStyles } from "../../theme/styles";
import { UserLocation } from "../../types";
import * as Location from "expo-location";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (location: UserLocation) => void;
  initialLocation?: UserLocation;
}

const LocationModal = ({
  visible,
  onClose,
  onSave,
  initialLocation,
}: LocationModalProps) => {
  const [location, setLocation] = useState<UserLocation>(
    initialLocation || {
      country: "",
      province: "",
      city: "",
    }
  );
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please enable location services to use this feature."
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      setLocation({
        country: address.country || "",
        province: address.region || "",
        city: address.city || "",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to get current location");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    onSave(location);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Update Location</Text>

          <TouchableOpacity
            style={styles.locationButton}
            onPress={getCurrentLocation}
            disabled={loading}
          >
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.locationButtonText}>
              {loading ? "Getting location..." : "Get Current Location"}
            </Text>
          </TouchableOpacity>

          <View style={globalStyles.inputsContainer}>
            <View style={globalStyles.inputContainer}>
              <View style={globalStyles.labelContainer}>
                <Text style={globalStyles.inputLabel}>Country</Text>
              </View>
              <TextInput
                style={globalStyles.input}
                value={location.country}
                onChangeText={(text) =>
                  setLocation((prev) => ({ ...prev, country: text }))
                }
                placeholder="Enter country"
              />
            </View>

            <View style={globalStyles.inputContainer}>
              <View style={globalStyles.labelContainer}>
                <Text style={globalStyles.inputLabel}>Province</Text>
              </View>
              <TextInput
                style={globalStyles.input}
                value={location.province}
                onChangeText={(text) =>
                  setLocation((prev) => ({ ...prev, province: text }))
                }
                placeholder="Enter province"
              />
            </View>

            <View style={globalStyles.inputContainer}>
              <View style={globalStyles.labelContainer}>
                <Text style={globalStyles.inputLabel}>City</Text>
              </View>
              <TextInput
                style={globalStyles.input}
                value={location.city}
                onChangeText={(text) =>
                  setLocation((prev) => ({ ...prev, city: text }))
                }
                placeholder="Enter city"
              />
            </View>
          </View>

          <View style={globalStyles.buttonsContainer}>
            <TouchableOpacity
              style={[globalStyles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[globalStyles.button, globalStyles.primaryButton]}
              onPress={handleSave}
            >
              <Text style={globalStyles.primaryButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  cancelButton: {
    backgroundColor: colors.lightGray2,
  },
  cancelButtonText: {
    color: colors.darkText,
    fontSize: 16,
    fontWeight: "600",
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: colors.lightGray2,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  locationButtonText: {
    fontSize: 16,
    color: colors.primary,
  },
});

export default LocationModal;
