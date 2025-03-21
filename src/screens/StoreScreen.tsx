import { StyleSheet, Text, View, SafeAreaView, ScrollView } from "react-native";
import React from "react";

const StoreScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollView}>
        {/* Search Section */}
        <View style={styles.searchSection}>
          {/* TODO:Search bar will go here */}
          <Text>Search</Text>
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
          <View style={styles.tabsSection}>
            <Text>Favorites</Text>
            <Text>Nearby</Text>
          </View>
          <View style={styles.storesListSection}>
            <Text>List of stores will go here</Text>
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
  headerSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  searchSection: {
    padding: 16,
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
  tabsSection: {
    padding: 16,
  },
  storesListSection: {
    padding: 16,
    backgroundColor: "pink",
  },
});
