import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { colors } from "../theme/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface StoreCardProps {
  name: string;
  distance: string;
  address: string;
  city: string;
  showAddButton?: boolean;
  onAdd?: () => void;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const StoreCard: React.FC<StoreCardProps> = ({
  name,
  distance,
  address,
  city,
  showAddButton,
  onAdd,
  onPress,
  isFavorite,
  onToggleFavorite,
}) => {
  return (
    <TouchableOpacity style={styles.storeItem} onPress={onPress}>
      <View style={styles.storeLogoContainer}>
        <View style={styles.storeLogo}></View>
      </View>
      <View style={styles.storeInfo}>
        <View style={styles.storeHeader}>
          <Text style={styles.storeName}>{name}</Text>
          <Text style={styles.storeDistance}>{distance}</Text>
        </View>
        <View style={styles.storeUpperContainer}>
          <View style={styles.storeAddressContainer}>
            <Text style={styles.storeAddress}>{address}</Text>
            <Text style={styles.storeCity}>{city}</Text>
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
