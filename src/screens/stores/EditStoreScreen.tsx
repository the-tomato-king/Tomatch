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
  updateOneDocInDB,
  readOneDoc,
} from "../../services/firebase/firebaseHelper";
import { COLLECTIONS } from "../../constants/firebase";
import { UserStore } from "../../types";
import SearchBar from "../../components/search/SearchBar";
import MapComponent from "../../components/Map";
import { NearbyStore } from "../../types/location";
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
  const [selectedMapStore, setSelectedMapStore] = useState<NearbyStore | null>(
    null
  );

  const [location, setLocation] = useState({
    latitude: 49.2827,
    longitude: -123.1207,
  });

  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        const storePath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_STORES}`;

        const storeData = await readOneDoc<UserStore>(storePath, storeId);
        if (storeData) {
          setCustomStoreName(storeData.name);
          setAddress(storeData.address);
          setLocation(storeData.location);
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

  const handleSaveStore = async () => {
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
  searchAddressContainer: {
    marginBottom: 15,
  },
});
