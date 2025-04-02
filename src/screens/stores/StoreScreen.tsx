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
import StoreCard from "../../components/StoreCard";
import SearchBar from "../../components/SearchBar";
import { UserStore, useUserStores } from "../../hooks/useUserStores";
import { updateDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { COLLECTIONS } from "../../constants/firebase";
import { useNavigation } from "@react-navigation/native";
import { StoreStackParamList } from "../../types/navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MainPageHeader from "../../components/MainPageHeader";
import MapComponent from "../../components/Map";
import { NearbyStore } from "../../types/location";
import LocationSelector from "../../components/LocationSelector";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocation } from "../../contexts/LocationContext";
import { convertNearbyStoreToUserStore } from "../../utils/storeConverters";
import NearbyStoresList from "../../components/NearbyStoresList";

type StoreScreenNavigationProp = NativeStackNavigationProp<StoreStackParamList>;

const StoreScreen = () => {
  const [activeTab, setActiveTab] = useState("favorites");
  const [address, setAddress] = useState("");
  const { favoriteStores, allStores, loading, error } = useUserStores();

  const navigation = useNavigation<StoreScreenNavigationProp>();
  const [selectedStore, setSelectedStore] = useState<NearbyStore | null>(null);
  const {
    userLocation,
    nearbyStores,
    isLoadingLocation,
    setUserLocationAndStores,
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

  const handleFavoriteStore = async (store: NearbyStore) => {
    const userStore = convertNearbyStoreToUserStore(store);
    try {
      // TODO: get current user id
      const userId = "user123";
      const storeRef = doc(
        db,
        COLLECTIONS.USERS,
        userId,
        COLLECTIONS.SUB_COLLECTIONS.USER_STORES
      );
      await setDoc(storeRef, userStore);
      // TODO: add success message
    } catch (error) {
      console.error("Error adding store to favorites:", error);
      Alert.alert("Error", "Failed to add store to favorites");
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
              address={userLocation?.address || null}
              isLoading={isLoadingLocation}
              onLocationSelect={handleLocationSelect}
            />
          </View>
          <View style={styles.mapContainer}>
            <MapComponent
              onStoreSelect={handleStoreSelect}
              userLocation={userLocation}
              stores={nearbyStores}
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
                Favorites
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
              <FavoritesStoresList stores={favoriteStores} />
            ) : (
              <NearbyStoresList stores={nearbyStores} onFavorite={handleFavoriteStore} />
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

// modify to receive store data as a parameter
const FavoritesStoresList = ({ stores }: { stores: UserStore[] }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<StoreStackParamList>>();

  const handleToggleFavorite = async (id: string) => {
    try {
      // TODO: get current user id
      const userId = "user123";
      const storeDocPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_STORES}/${id}`;

      // update favorite status
      await updateDoc(doc(db, storeDocPath), {
        is_favorite: false,
        updated_at: new Date(),
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  return stores.length === 0 ? (
    <Text style={styles.emptyListText}>No favorite stores yet</Text>
  ) : (
    <FlatList
      data={stores}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <StoreCard
          name={item.name}
          distance={item.distance || "Unknown"}
          address={item.address}
          city={item.address.split(",").slice(1).join(",").trim()}
          isFavorite={item.is_favorite}
          onToggleFavorite={() => handleToggleFavorite(item.id)}
          onPress={() =>
            navigation.navigate("StoreDetail", { storeId: item.id })
          }
        />
      )}
    />
  );
};

// const NearbyStoresList = ({ stores }: { stores: UserStore[] }) => {
//   const navigation =
//     useNavigation<NativeStackNavigationProp<StoreStackParamList>>();

//   const handleToggleFavorite = async (id: string, currentStatus: boolean) => {
//     try {
//       // TODO: get current user id
//       const userId = "user123";
//       const storeDocPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_STORES}/${id}`;

//       // update favorite status
//       await updateDoc(doc(db, storeDocPath), {
//         is_favorite: !currentStatus,
//         updated_at: new Date(),
//       });
//     } catch (error) {
//       console.error("Error toggling favorite:", error);
//     }
//   };

//   return stores.length === 0 ? (
//     <Text style={styles.emptyListText}>No stores found nearby</Text>
//   ) : (
//     <FlatList
//       data={stores}
//       keyExtractor={(item) => item.id}
//       renderItem={({ item }) => (
//         <StoreCard
//           name={item.name}
//           distance={item.distance || "Unknown"}
//           address={item.address}
//           city={item.address.split(",").slice(1).join(",").trim()}
//           isFavorite={item.is_favorite}
//           onToggleFavorite={() =>
//             handleToggleFavorite(item.id, item.is_favorite)
//           }
//           onPress={() =>
//             navigation.navigate("StoreDetail", { storeId: item.id })
//           }
//         />
//       )}
//     />
//   );
// };

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
