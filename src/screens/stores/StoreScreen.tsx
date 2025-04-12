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
  Dimensions,
  PanResponder,
  Animated,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
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

const { height, width } = Dimensions.get("window");

const SMALL_HEIGHT = height * 0.25;
const MEDIUM_HEIGHT = height * 0.5;
const LARGE_HEIGHT = height * 0.75;

const StoreScreen = () => {
  const [activeTab, setActiveTab] = useState("favorites");
  const [address, setAddress] = useState("");
  const { favoriteStores, allStores, loading, error } = useUserStores();
  const { userId } = useAuth();
  const [selectedStore, setSelectedStore] = useState<NearbyStore | null>(null);
  const {
    userLocation,
    nearbyStores,
    isLoadingLocation,
    setUserLocationAndStores,
    lastSavedLocation,
    lastSavedStores,
  } = useLocation();

  const panelHeight = useRef(new Animated.Value(SMALL_HEIGHT)).current;
  const [currentHeight, setCurrentHeight] = useState(SMALL_HEIGHT);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const newHeight = currentHeight - gestureState.dy;
        if (newHeight >= SMALL_HEIGHT && newHeight <= LARGE_HEIGHT) {
          panelHeight.setValue(newHeight);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        let targetHeight = currentHeight;

        if (gestureState.dy < 0) {
          if (currentHeight < MEDIUM_HEIGHT) {
            targetHeight = MEDIUM_HEIGHT;
          } else {
            targetHeight = LARGE_HEIGHT;
          }
        } else if (gestureState.dy > 0) {
          if (currentHeight > MEDIUM_HEIGHT) {
            targetHeight = MEDIUM_HEIGHT;
          } else {
            targetHeight = SMALL_HEIGHT;
          }
        }

        Animated.spring(panelHeight, {
          toValue: targetHeight,
          useNativeDriver: false,
          friction: 8,
        }).start();

        setCurrentHeight(targetHeight);
      },
    })
  ).current;

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

  const expandList = () => {
    let targetHeight;
    if (currentHeight === SMALL_HEIGHT) {
      targetHeight = MEDIUM_HEIGHT;
    } else if (currentHeight === MEDIUM_HEIGHT) {
      targetHeight = LARGE_HEIGHT;
    } else {
      return;
    }

    Animated.spring(panelHeight, {
      toValue: targetHeight,
      useNativeDriver: false,
      friction: 8,
    }).start();
    setCurrentHeight(targetHeight);
  };

  const collapseList = () => {
    let targetHeight;
    if (currentHeight === LARGE_HEIGHT) {
      targetHeight = MEDIUM_HEIGHT;
    } else if (currentHeight === MEDIUM_HEIGHT) {
      targetHeight = SMALL_HEIGHT;
    } else {
      return;
    }

    Animated.spring(panelHeight, {
      toValue: targetHeight,
      useNativeDriver: false,
      friction: 8,
    }).start();
    setCurrentHeight(targetHeight);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapWrapper}>
        <View style={styles.searchSection}>
          <SearchBar
            value={address}
            onChangeText={setAddress}
            placeholder="Search for an address"
          />
        </View>

        {/* Map Section */}
        <View style={[styles.mapSection, { height: height * 0.65 }]}>
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
      </View>

      <Animated.View
        style={[
          styles.draggablePanel,
          {
            height: panelHeight,
          },
        ]}
      >
        <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
          <View style={styles.dragHandle} />
          <View style={styles.controlButtons}>
            {currentHeight > SMALL_HEIGHT && (
              <TouchableOpacity
                onPress={collapseList}
                style={styles.arrowButton}
              >
                <Text style={styles.arrowText}>-</Text>
              </TouchableOpacity>
            )}
            {currentHeight < LARGE_HEIGHT && (
              <TouchableOpacity onPress={expandList} style={styles.arrowButton}>
                <Text style={styles.arrowText}>+</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

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

        <View style={styles.listContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : activeTab === "favorites" ? (
            <MyStoresList stores={allStores} />
          ) : (
            <NearbyStoresList
              stores={nearbyStores.length > 0 ? nearbyStores : lastSavedStores}
              onFavorite={handleAddStore}
              favoriteStores={allStores}
              selectedStore={selectedStore}
            />
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default StoreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ios.systemGroupedBackground,
  },
  mapWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  searchSection: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  mapSection: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  locationSection: {
    position: "absolute",
    top: 80,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  mapContainer: {
    width: "100%",
    height: "100%",
  },
  draggablePanel: {
    position: "absolute",
    bottom: 0,
    left: 8,
    right: 8,
    backgroundColor: colors.ios.secondarySystemGroupedBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 6,
    zIndex: 10,
  },
  dragHandleContainer: {
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: colors.ios.secondarySystemGroupedBackground,
    flexDirection: "row",
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.ios.systemGray4,
    marginTop: 5,
  },
  controlButtons: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
  },
  arrowButton: {
    padding: 5,
    marginLeft: 10,
  },
  arrowText: {
    fontSize: 20,
    color: colors.ios.systemBlue,
  },
  tabsContainer: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 10,
    marginHorizontal: 16,
    backgroundColor: colors.ios.systemGray6,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTabButton: {
    backgroundColor: colors.ios.systemBlue,
  },
  tabText: {
    fontSize: 16,
    color: colors.ios.secondaryLabel,
    fontWeight: "500",
  },
  activeTabText: {
    color: colors.white,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  errorText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 17,
    color: colors.ios.systemRed,
  },
});
