import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import { colors } from "../theme/colors";
import StoreCard from "../components/StoreCard";
import SearchBar from "../components/SearchBar";
const StoreScreen = () => {
  const [activeTab, setActiveTab] = useState("favorites");
  const [address, setAddress] = useState("");
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
            {activeTab === "favorites" ? (
              <FavoritesStoresList />
            ) : (
              <NearbyStoresList />
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Mock data TODO: Replace with actual data
const favoriteStores = [
  {
    id: "1",
    name: "Walmart",
    distance: "0.5km",
    address: "123 maple st",
    city: "Vancouver, BC, V6T 1Z7",
    isFavorite: true,
  },
  {
    id: "2",
    name: "Walmart",
    distance: "0.5km",
    address: "123 maple st",
    city: "Vancouver, BC, V6T 1Z7",
    isFavorite: true,
  },
  {
    id: "3",
    name: "Walmart",
    distance: "0.5km",
    address: "123 maple st",
    city: "Vancouver, BC, V6T 1Z7",
    isFavorite: true,
  },
];

const nearbyStores = [
  {
    id: "1",
    name: "Walmart",
    distance: "0.5km",
    address: "123 maple st",
    city: "Vancouver, BC, V6T 1Z7",
    isFavorite: true,
  },
  {
    id: "2",
    name: "Costco",
    distance: "1.2km",
    address: "456 oak ave",
    city: "Vancouver, BC, V6T 2A1",
    isFavorite: false,
  },
  {
    id: "3",
    name: "Save-On-Foods",
    distance: "2.0km",
    address: "789 pine rd",
    city: "Vancouver, BC, V6T 3B2",
    isFavorite: false,
  },
];

const FavoritesStoresList = () => {
  const handleToggleFavorite = (id: string) => {
    console.log(`Toggle favorite for store ${id}`);
  };

  return (
    <FlatList
      data={favoriteStores}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <StoreCard
          name={item.name}
          distance={item.distance}
          address={item.address}
          city={item.city}
          isFavorite={item.isFavorite}
          onToggleFavorite={() => handleToggleFavorite(item.id)}
          onPress={() => console.log(`Pressed store ${item.id}`)}
        />
      )}
    />
  );
};

const NearbyStoresList = () => {
  const handleToggleFavorite = (id: string) => {
    console.log(`Toggle favorite for store ${id}`);
  };

  return (
    <FlatList
      data={nearbyStores}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <StoreCard
          name={item.name}
          distance={item.distance}
          address={item.address}
          city={item.city}
          isFavorite={item.isFavorite}
          onToggleFavorite={() => handleToggleFavorite(item.id)}
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
});
