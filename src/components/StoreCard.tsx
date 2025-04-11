import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { colors } from "../theme/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import StoreLogo from "./StoreLogo";
import { StoreBrand } from "../types";

interface StoreCardProps {
  name: string;
  distance: string | null;
  address: string;
  showAddButton?: boolean;
  onAdd?: () => void;
  onPress: () => void;
  isFavorite: boolean;
  brand?: StoreBrand | null;
  onToggleFavorite: () => void;
}

const StoreCard: React.FC<StoreCardProps> = ({
  name,
  distance,
  address,
  showAddButton,
  onAdd,
  onPress,
  isFavorite,
  brand,
  onToggleFavorite,
}) => {
  return (
    <TouchableOpacity style={styles.storeItem} onPress={onPress}>
      <View style={styles.storeLogoContainer}>
        {brand ? (
          <StoreLogo brand={brand.logo} width={80} height={80} />
        ) : (
          <View style={styles.storeLogo}></View>
        )}
      </View>
      <View style={styles.storeInfo}>
        <View style={styles.storeHeader}>
          <Text style={styles.storeName}>{name}</Text>
          {distance && <Text style={styles.storeDistance}>{distance}</Text>}
        </View>
        <View style={styles.storeUpperContainer}>
          <View style={styles.storeAddressContainer}>
            <Text style={styles.storeAddress}>{address}</Text>
          </View>
          {showAddButton !== undefined ? (
            showAddButton && (
              <TouchableOpacity style={styles.actionButton} onPress={onAdd}>
                <MaterialCommunityIcons
                  name="plus"
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>
            )
          ) : (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onToggleFavorite}
            >
              <MaterialCommunityIcons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default StoreCard;

const styles = StyleSheet.create({
  storeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray2,
  },
  storeLogoContainer: {
    marginRight: 16,
  },
  storeLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
  },
  storeInfo: {
    flex: 1,
  },
  storeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "bold",
    width: "80%",
  },
  storeDistance: {
    fontSize: 16,
  },
  storeUpperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  storeAddressContainer: {
    flex: 1,
  },
  storeAddress: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 2,
  },
  storeCity: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  actionButton: {
    padding: 8,
  },
  heartIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "red",
  },
  emptyHeartIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.lightGray2,
  },
});
