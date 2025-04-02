import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { globalStyles } from "../../theme/styles";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StoreStackParamList } from "../../types/navigation";
import { createDoc } from "../../services/firebase/firebaseHelper";
import { COLLECTIONS } from "../../constants/firebase";
import { BaseUserStore } from "../../types";
import SearchBar from "../../components/SearchBar";
import { useBrands } from "../../hooks/useBrands";
import { StoreBrand } from "../../types";
import StoreLogo from "../../components/StoreLogo";

type AddStoreScreenNavigationProp =
  NativeStackNavigationProp<StoreStackParamList>;

const AddStoreScreen = () => {
  const navigation = useNavigation<AddStoreScreenNavigationProp>();
  const [storeName, setStoreName] = useState("");
  const [customStoreName, setCustomStoreName] = useState("");
  const [address, setAddress] = useState("");
  const [addressSearch, setAddressSearch] = useState("");
  const { brands, loading } = useBrands();
  const [selectedBrand, setSelectedBrand] = useState<StoreBrand | null>(null);

  // TODO: get location from user's device, now use a fixed location
  const [location, setLocation] = useState({
    latitude: 49.2827, // Vancouver's approximate coordinates
    longitude: -123.1207,
  });

  const searchAddress = (query: string) => {
    // TODO: access google map api to search address, now treat it as a text input
    setAddress(query);
  };

  const handleSaveStore = async () => {
    // validate input
    if (!selectedBrand) {
      Alert.alert("Error", "Please select a store brand");
      return;
    }

    if (!customStoreName.trim()) {
      Alert.alert("Error", "Please enter a store name");
      return;
    }

    if (!address.trim()) {
      Alert.alert("Error", "Please enter a store address");
      return;
    }

    try {
      // create store data object
      const storeData: BaseUserStore = {
        brand_id: selectedBrand.id,
        name: customStoreName.trim(),
        address: address.trim(),
        location: location,
        is_favorite: false,
        last_visited: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        is_inactive: false,
      };

      // TODO: get current user id, now use a fixed user id
      const userId = "user123";
      const userStorePath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_STORES}`;

      const docId = await createDoc(userStorePath, storeData);

      if (docId) {
        Alert.alert("Success", "Store information saved", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert("Error", "Failed to save, please try again");
      }
    } catch (error) {
      console.error("Error saving store:", error);
      Alert.alert("Error", "Failed to save, please try again");
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const generateDefaultStoreName = (brandName: string, address: string) => {
    const shortAddress = address.split(",")[0];
    return `${brandName} - ${shortAddress}`;
  };

  const handleSelectBrand = () => {
    navigation.navigate("SelectStoreBrand", {
      onSelect: (brand: StoreBrand) => {
        setSelectedBrand(brand);
        const defaultName = generateDefaultStoreName(
          brand.name,
          address || "New Store"
        );
        setStoreName(brand.name);
        setCustomStoreName(defaultName);
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.formContainer}>
          <View style={styles.headerSection}>
            <TouchableOpacity
              style={styles.logoContainer}
              onPress={handleSelectBrand}
            >
              {selectedBrand ? (
                <StoreLogo brand={selectedBrand.logo} width={80} height={80} />
              ) : (
                <View style={styles.emptyLogoContainer}>
                  <Text style={styles.logoText}>Select Brand</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.nameInputContainer}>
              <Text style={styles.inputLabel}>
                Store Name<Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={styles.nameInput}
                value={customStoreName}
                onChangeText={setCustomStoreName}
                placeholder="Enter store name"
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationSection}>
            <View style={styles.mapPlaceholder}>
              <Text>Google Map (TODO)</Text>
            </View>

            <View style={styles.searchAddressContainer}>
              <SearchBar
                value={address}
                onChangeText={setAddress} // TODO: search address
                placeholder="Search for an address"
              />
            </View>
          </View>

          <View style={[globalStyles.buttonsContainer, { marginTop: 20 }]}>
            <TouchableOpacity
              style={[globalStyles.button, globalStyles.primaryButton]}
              onPress={handleCancel}
            >
              <Text style={globalStyles.primaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[globalStyles.button, globalStyles.primaryButton]}
              onPress={handleSaveStore}
            >
              <Text style={globalStyles.primaryButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddStoreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    backgroundColor: "#fff",
  },
  emptyLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
  },
  logoText: {
    fontSize: 12,
    color: "#757575",
    textAlign: "center",
  },
  nameInputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  requiredStar: {
    color: "red",
  },
  nameInput: {
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#fff",
  },
  locationSection: {
    marginBottom: 10,
    backgroundColor: "pink",
    borderRadius: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  mapPlaceholder: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "teal"
  },
  addressInput: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  locationButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  locationButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    padding: 10,
    width: "48%",
    alignItems: "center",
    backgroundColor: "#eee",
  },
  buttonText: {
    fontSize: 16,
  },
  bottomButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    padding: 10,
    width: "48%",
    alignItems: "center",
    backgroundColor: "#eee",
  },
  saveButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    padding: 10,
    width: "48%",
    alignItems: "center",
    backgroundColor: "#eee",
  },
  cancelButtonText: {
    fontSize: 16,
  },
  saveButtonText: {
    fontSize: 16,
  },
  searchAddressContainer: {
    marginBottom: 15,
  },
});
