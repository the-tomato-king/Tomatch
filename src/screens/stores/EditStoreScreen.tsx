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
import React, { useState, useEffect } from "react";
import { globalStyles } from "../../theme/styles";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StoreStackParamList } from "../../types/navigation";
import {
  createDoc,
  updateOneDocInDB,
  readOneDoc,
} from "../../services/firebase/firebaseHelper";
import { COLLECTIONS } from "../../constants/firebase";
import { BaseUserStore, UserStore } from "../../types";
import SearchBar from "../../components/SearchBar";
import { useBrands } from "../../hooks/useBrands";
import { StoreBrand } from "../../types";
import StoreLogo from "../../components/StoreLogo";
import MapComponent from "../../components/Map";
import { NearbyStore } from "../../types/location";
import LocationSelector from "../../components/LocationSelector";
import { colors } from "../../theme/colors";
import { useAuth } from "../../contexts/AuthContext";

type AddStoreScreenNavigationProp =
  NativeStackNavigationProp<StoreStackParamList>;

type EditStoreScreenRouteProp = RouteProp<StoreStackParamList, "EditStore">;

const EditStoreScreen = () => {
  const navigation = useNavigation<AddStoreScreenNavigationProp>();
  const route = useRoute<EditStoreScreenRouteProp>();
  const { storeId } = route.params;
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [customStoreName, setCustomStoreName] = useState("");
  const [address, setAddress] = useState("");
  const [addressSearch, setAddressSearch] = useState("");
  const { brands, loading: brandsLoading } = useBrands();
  const [brandId, setBrandId] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<StoreBrand | null>(null);
  const [selectedMapStore, setSelectedMapStore] = useState<NearbyStore | null>(
    null
  );

  // TODO: get location from user's device, now use a fixed location
  const [location, setLocation] = useState({
    latitude: 49.2827, // Vancouver's approximate coordinates
    longitude: -123.1207,
  });

  // load existing store data
  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        const storePath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_STORES}`;

        const storeData = await readOneDoc<UserStore>(storePath, storeId);
        if (storeData) {
          setBrandId(storeData.brand_id);
          setCustomStoreName(storeData.name);
          setAddress(storeData.address);
          setLocation(storeData.location);

          if (storeData.brand_id) {
            const brandPath = COLLECTIONS.STORE_BRANDS;
            const brandData = await readOneDoc<StoreBrand>(
              brandPath,
              storeData.brand_id
            );
            if (brandData) {
              setSelectedBrand(brandData);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching store details:", error);
        Alert.alert("Error", "Failed to load store details");
      }
    };

    if (storeId) {
      fetchStoreDetails();
    }
  }, [storeId]);

  const searchAddress = (query: string) => {
    // TODO: access google map api to search address, now treat it as a text input
    setAddress(query);
  };

  const handleSaveStore = async () => {
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
      const storePath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_STORES}`;

      const updateData = {
        brand_id: selectedBrand?.id || brandId,
        name: customStoreName.trim(),
        address: address.trim(),
        location: location,
        updated_at: new Date(),
      };

      const success = await updateOneDocInDB(storePath, storeId, updateData);

      if (success) {
        Alert.alert("Success", "Store information updated", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert("Error", "Failed to update, please try again");
      }
    } catch (error) {
      console.error("Error updating store:", error);
      Alert.alert("Error", "Failed to update, please try again");
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
      },
    });
  };

  const handleStoreSelect = (store: NearbyStore) => {
    setSelectedMapStore(store);
    setAddress(store.address);
    setLocation({
      latitude: store.coordinate.latitude,
      longitude: store.coordinate.longitude,
    });
  };

  const handleLocationSelect = async (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setLocation({
      latitude: location.latitude,
      longitude: location.longitude,
    });
    setAddress(location.address);
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
            <View style={styles.mapContainer}>
              <MapComponent
                onStoreSelect={handleStoreSelect}
                userLocation={location}
                lastSavedLocation={location}
                stores={[]}
              />
            </View>

            <View style={styles.searchAddressContainer}>
              <SearchBar
                value={address}
                onChangeText={setAddress}
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
              <Text style={globalStyles.primaryButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditStoreScreen;

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
    borderRadius: 10,
    padding: 10,
    backgroundColor: colors.white,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  mapContainer: {
    height: 300,
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 10,
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
