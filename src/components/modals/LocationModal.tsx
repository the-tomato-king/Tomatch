import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
} from "react-native";
import { colors } from "../../theme/colors";
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

      const newLocation = {
        country: address.country || "",
        province: address.region || "",
        city: address.city || "",
      };

      setLocation(newLocation);
    } catch (error) {
      Alert.alert("Error", "Failed to get current location");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!location.country.trim()) {
      Alert.alert("Error", "Please enter a country");
      return;
    }
    onSave(location);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Update Location</Text>

          <TouchableOpacity
            style={styles.locationButton}
            onPress={getCurrentLocation}
            disabled={loading}
          >
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={20}
              color={colors.ios.systemBlue}
            />
            <Text style={styles.locationButtonText}>
              {loading ? "Getting location..." : "Get Current Location"}
            </Text>
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Country *</Text>
            <TextInput
              style={styles.input}
              value={location.country}
              onChangeText={(text) =>
                setLocation((prev) => ({ ...prev, country: text }))
              }
              placeholder="Enter country"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Province/State</Text>
            <TextInput
              style={styles.input}
              value={location.province}
              onChangeText={(text) =>
                setLocation((prev) => ({ ...prev, province: text }))
              }
              placeholder="Enter province or state"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={location.city}
              onChangeText={(text) =>
                setLocation((prev) => ({ ...prev, city: text }))
              }
              placeholder="Enter city"
            />
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 13,
    padding: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 16,
  },
  locationButtonText: {
    fontSize: 17,
    color: colors.ios.systemBlue,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    marginBottom: 8,
  },
  input: {
    fontSize: 17,
    padding: 12,
    backgroundColor: colors.ios.systemGray6,
    borderRadius: 8,
  },
  buttons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.ios.systemGray6,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButton: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.ios.systemBlue,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 17,
    color: colors.ios.label,
  },
  saveText: {
    fontSize: 17,
    color: "white",
    fontWeight: "600",
  },
});

export default LocationModal;
