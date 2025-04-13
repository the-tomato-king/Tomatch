import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PriceRecord } from "../../types";
import { colors } from "../../theme/colors";
import { formatRecordDateTime } from "../../utils/dateUtils";
import { useAuth } from "../../contexts/AuthContext";
import { getUserProductById } from "../../services/userProductService";
import { PriceDisplay } from "../PriceDisplay";
import { isCountUnit } from "../../constants/units";

interface StorePriceRecordListProps {
  records: PriceRecord[];
  loading?: boolean;
  onSort?: (sortType: "date" | "price" | "name") => void;
  onRecordPress?: (recordId: string) => void;
}

interface ProductInfo {
  name: string;
  category: string;
}

const SortButton = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.sortButton, active && styles.activeSortButton]}
    onPress={onPress}
  >
    <Text
      style={[styles.sortButtonText, active && styles.activeSortButtonText]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

export const StorePriceRecordList: React.FC<StorePriceRecordListProps> = ({
  records,
  loading = false,
  onSort,
  onRecordPress,
}) => {
  const { userId } = useAuth();
  const [activeSortType, setActiveSortType] = useState<
    "date" | "price" | "name"
  >("date");
  const [productInfoMap, setProductInfoMap] = useState<
    Record<string, ProductInfo>
  >({});

  useEffect(() => {
    const loadProductInfo = async () => {
      const productMap: Record<string, ProductInfo> = {};

      for (const record of records) {
        if (!productInfoMap[record.user_product_id]) {
          const product = await getUserProductById(
            userId!,
            record.user_product_id
          );
          if (product) {
            productMap[record.user_product_id] = {
              name: product.name,
              category: product.category,
            };
          }
        }
      }

      setProductInfoMap((prev) => ({ ...prev, ...productMap }));
    };

    loadProductInfo();
  }, [records, userId]);

  const handleSort = (sortType: "date" | "price" | "name") => {
    setActiveSortType(sortType);
    onSort?.(sortType);
  };

  const renderItem = ({ item: record }: { item: PriceRecord }) => (
    <TouchableOpacity
      style={styles.recordItem}
      onPress={() => onRecordPress?.(record.id)}
    >
      <View style={styles.recordMainInfo}>
        <Text style={styles.productName}>
          {productInfoMap[record.user_product_id]?.name || "Unknown Product"}
        </Text>
        <Text style={styles.recordDate}>
          {formatRecordDateTime(record.recorded_at)}
        </Text>
      </View>
      <View style={styles.priceContainer}>
        <PriceDisplay
          standardPrice={parseFloat(record.standard_unit_price)}
          measurementType={
            isCountUnit(record.original_unit) ? "count" : "measurable"
          }
        />
        <Text style={styles.unitText}>/{record.original_unit}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="script-text-outline"
        size={48}
        color={colors.secondaryText}
      />
      <Text style={styles.emptyText}>No price records found</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Price Records</Text>
        <Text style={styles.recordCount}>({records.length})</Text>
      </View>
      <FlatList
        data={records}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sortContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray2,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: colors.lightGray2,
  },
  activeSortButton: {
    backgroundColor: colors.primary,
  },
  sortButtonText: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  activeSortButtonText: {
    color: colors.white,
  },
  listContent: {
    flexGrow: 1,
  },
  recordItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray2,
  },
  recordMainInfo: {
    flex: 1,
    marginRight: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.darkText,
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  unitText: {
    fontSize: 14,
    color: colors.secondaryText,
    marginLeft: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: "center",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.darkText,
  },
  recordCount: {
    fontSize: 16,
    color: colors.secondaryText,
    marginLeft: 4,
  },
});
