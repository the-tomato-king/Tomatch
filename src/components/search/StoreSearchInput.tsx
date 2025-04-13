import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { globalStyles } from "../../theme/styles";
import { colors } from "../../theme/colors";
import { COLLECTIONS } from "../../constants/firebase";
import { readAllDocs } from "../../services/firebase/firebaseHelper";
import { UserStore } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation } from "../../contexts/LocationContext";
import { calculateDistance, formatDistance } from "../../utils/distance";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

interface StoreSearchInputProps {
  inputValue: string;
  onChangeInputValue: (value: string) => void;
  onSelectStore: (store: UserStore) => void;
  initialStoreId?: string;
  disabled?: boolean;
}

interface StoreWithDistance extends UserStore {
  distance?: number;
  formattedDistance?: string;
}

const StoreSearchInput = ({
  inputValue,
  onChangeInputValue,
  onSelectStore,
  initialStoreId,
  disabled,
}: StoreSearchInputProps) => {
  const [stores, setStores] = useState<StoreWithDistance[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { userId } = useAuth();
  const { userLocation, setUserLocationAndStores } = useLocation();

  // Function to calculate distances and sort stores
  const processStoresWithDistance = (
    stores: UserStore[]
  ): StoreWithDistance[] => {
    if (!userLocation) return stores as StoreWithDistance[];

    return stores
      .map((store) => {
        if (!store.location) return { ...store } as StoreWithDistance;

        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          store.location.latitude,
          store.location.longitude
        );

        return {
          ...store,
          distance,
          formattedDistance: formatDistance(distance),
        } as StoreWithDistance;
      })
      .sort((a, b) => {
        if (!a.distance) return 1;
        if (!b.distance) return -1;
        return a.distance - b.distance;
      });
  };

  // Refresh location handler
  const handleRefreshLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        await setUserLocationAndStores({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: "",
        });
      }
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const storesPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_STORES}`;
        const storesData = await readAllDocs<UserStore>(storesPath);

        const processedStores = processStoresWithDistance(storesData);
        setStores(processedStores);

        // Handle initial selection
        if (initialStoreId) {
          const selectedStore = processedStores.find(
            (store) => store.id === initialStoreId
          );
          if (selectedStore) {
            onSelectStore(selectedStore);
            onChangeInputValue(selectedStore.name);
          }
        } else if (processedStores.length > 0 && userLocation) {
          // Auto-select nearest store if no initial store
          const nearestStore = processedStores[0];
          onSelectStore(nearestStore);
          onChangeInputValue(nearestStore.name);
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };

    fetchStores();
  }, [initialStoreId, userId, userLocation]);

  return (
    <TouchableWithoutFeedback onPress={() => setShowSuggestions(false)}>
      <View style={styles.wrapper}>
        <View style={[globalStyles.inputContainer]}>
          <TouchableOpacity
            style={globalStyles.labelContainer}
            onPress={handleRefreshLocation}
          >
            <Ionicons name="location" size={18} color={colors.primary} />
          </TouchableOpacity>

          <TextInput
            style={[globalStyles.input]}
            value={inputValue}
            onChangeText={onChangeInputValue}
            placeholder="Search store..."
            placeholderTextColor={colors.secondaryText}
            onFocus={() => setShowSuggestions(true)}
            editable={!disabled}
          />
        </View>

        {showSuggestions && stores.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={stores}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => {
                    onSelectStore(item);
                    setShowSuggestions(false);
                    onChangeInputValue(item.name);
                  }}
                >
                  <Text style={styles.suggestionText} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.formattedDistance && (
                    <Text style={styles.distanceText}>
                      {item.formattedDistance}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    zIndex: 1000,
  },
  suggestionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 12,
    maxHeight: 200,
    marginTop: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  suggestionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: Platform.OS === "ios" ? 0.5 : 1,
    borderBottomColor: colors.lightGray2,
  },
  suggestionText: {
    flex: 1,
    fontSize: 16,
    color: colors.darkText,
    ...Platform.select({
      ios: {
        fontWeight: "400",
      },
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
  distanceText: {
    fontSize: 14,
    color: colors.secondaryText,
    marginLeft: 8,
  },
});

export default StoreSearchInput;
