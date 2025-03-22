import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { colors } from "../theme/colors";
import StoreCard from "../components/StoreCard";
import SearchBar from "../components/SearchBar";
import { UserStore, useUserStores } from "../hooks/useUserStores";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";
import { COLLECTIONS } from "../constants/firebase";

const StoreScreen = () => {
  const [activeTab, setActiveTab] = useState("favorites");
  const [address, setAddress] = useState("");
  const { favoriteStores, allStores, loading, error } = useUserStores();

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
          {/* Location Section */}
          <View style={styles.locationSection}>
            <Text style={styles.locationText}>
              Current Location: 7395 maple st
            </Text>
          </View>
          <View style={styles.mapContainer}>
            <Text>TODO: Implement google map api</Text>
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
              <NearbyStoresList stores={allStores} />
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

// modify to receive store data as a parameter
const FavoritesStoresList = ({ stores }: { stores: UserStore[] }) => {
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
          city={item.address.split(",").slice(1).join(",").trim()} // simple address format
          isFavorite={item.is_favorite}
          onToggleFavorite={() => handleToggleFavorite(item.id)}
          onPress={() => console.log(`Pressed store ${item.id}`)}
        />
      )}
    />
  );
};

const NearbyStoresList = ({ stores }: { stores: UserStore[] }) => {
  const handleToggleFavorite = async (id: string, currentStatus: boolean) => {
    try {
      // TODO: get current user id
      const userId = "user123";
      const storeDocPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_STORES}/${id}`;

      // update favorite status
      await updateDoc(doc(db, storeDocPath), {
        is_favorite: !currentStatus,
        updated_at: new Date(),
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  return stores.length === 0 ? (
    <Text style={styles.emptyListText}>No stores found nearby</Text>
  ) : (
    <FlatList
      data={stores}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <StoreCard
          name={item.name}
          distance={item.distance || "Unknown"}
          address={item.address}
          city={item.address.split(",").slice(1).join(",").trim()} // simple address format
          isFavorite={item.is_favorite}
          onToggleFavorite={() =>
            handleToggleFavorite(item.id, item.is_favorite)
          }
          onPress={() => console.log(`Pressed store ${item.id}`)}
        />
      )}
    />
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
    paddingHorizontal: 16,
    paddingBottom: 16,
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
    backgroundColor: "pink",
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
