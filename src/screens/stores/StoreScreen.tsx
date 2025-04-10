import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { colors } from "../../theme/colors";
import SearchBar from "../../components/search/SearchBar";
import { useUserStores } from "../../hooks/useUserStores";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { COLLECTIONS } from "../../constants/firebase";
import { useNavigation } from "@react-navigation/native";
import { StoreStackParamList } from "../../types/navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MapComponent from "../../components/Map";
import { NearbyStore } from "../../types/location";
import LocationSelector from "../../components/LocationSelector";
import { useLocation } from "../../contexts/LocationContext";
import { convertNearbyStoreToUserStore } from "../../utils/storeConverters";
import NearbyStoresList from "../../components/lists/NearbyStoresList";
import MyStoresList from "../../components/lists/MyStoresList";
import { useAuth } from "../../contexts/AuthContext";
type StoreScreenNavigationProp = NativeStackNavigationProp<StoreStackParamList>;

const StoreScreen = () => {
  const [activeTab, setActiveTab] = useState("favorites");
  const [address, setAddress] = useState("");
  const { favoriteStores, allStores, loading, error } = useUserStores();
  const { userId } = useAuth();
  const navigation = useNavigation<StoreScreenNavigationProp>();
  const [selectedStore, setSelectedStore] = useState<NearbyStore | null>(null);
  const {
    userLocation,
    nearbyStores,
    isLoadingLocation,
    setUserLocationAndStores,
    lastSavedLocation,
    lastSavedStores,
  } = useLocation();

  const handleStoreSelect = (store: NearbyStore) => {
    setSelectedStore(store);
    setActiveTab("nearby");
  };

  const handleLocationSelect = async (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    await setUserLocationAndStores(location);
  };

  const handleAddStore = async (store: NearbyStore) => {
    try {
      const userStoresRef = collection(
        db,
        COLLECTIONS.USERS,
        userId as string,
        COLLECTIONS.SUB_COLLECTIONS.USER_STORES
      );

      await addDoc(userStoresRef, convertNearbyStoreToUserStore(store));
      Alert.alert("Success", "Store added to your list");
    } catch (error) {
      console.error("Error adding store:", error);
      Alert.alert("Error", "Failed to add store to your list");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollView}>
        <View style={styles.searchSection}>
          <SearchBar
            value={address}
            onChangeText={setAddress}
            placeholder="Search for an address"
          />
        </View>

        {/* Map Section */}
        <View style={styles.mapSection}>
          <View style={styles.locationSection}>
            <LocationSelector
              address={
                userLocation?.address || lastSavedLocation?.address || null
              }
              isLoading={isLoadingLocation}
              onLocationSelect={handleLocationSelect}
            />
          </View>
          <View style={styles.mapContainer}>
            <MapComponent
              onStoreSelect={handleStoreSelect}
              userLocation={userLocation || lastSavedLocation}
              lastSavedLocation={lastSavedLocation}
              stores={nearbyStores.length > 0 ? nearbyStores : lastSavedStores}
            />
          </View>
        </View>
        <View style={styles.storesListSection}>
          {/* Tabs Section */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "favorites" ? styles.activeTabButton : {},
              ]}
              onPress={() => setActiveTab("favorites")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "favorites" ? styles.activeTabText : {},
                ]}
              >
                My Stores
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "nearby" ? styles.activeTabButton : {},
              ]}
              onPress={() => setActiveTab("nearby")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "nearby" ? styles.activeTabText : {},
                ]}
              >
                Nearby
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stores List Content */}
          <View style={styles.storesListContent}>
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : activeTab === "favorites" ? (
              <MyStoresList stores={allStores} />
            ) : (
              <NearbyStoresList
                stores={
                  nearbyStores.length > 0 ? nearbyStores : lastSavedStores
                }
                onFavorite={handleAddStore}
                favoriteStores={allStores}
              />
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default StoreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  searchSection: {
    padding: 16,
  },
  headerSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  locationSection: {
    paddingBottom: 16,
    width: "100%",
  },
  locationText: {
    fontSize: 16,
  },
  mapSection: {
    padding: 16,
    alignItems: "center",
  },
  mapContainer: {
    width: "100%",
    height: 300,
    overflow: "hidden",
    borderRadius: 10,
  },
  storesListSection: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  tabsContainer: {
    flexDirection: "row",
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#f0f0f0",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
  },
  storesListContent: {
    flex: 1,
    height: 300,
  },
  emptyListText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: colors.secondaryText,
  },
  errorText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "red",
  },
});
