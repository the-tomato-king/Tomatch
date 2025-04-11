import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { formatRecordDateTime } from "../../utils/dateUtils";
import { PriceRecord } from "../../types";
import { colors } from "../../theme/colors";

interface ProductPriceRecordListProps {
  priceRecords: PriceRecord[];
  navigation: any;
}

export const ProductPriceRecordList: React.FC<ProductPriceRecordListProps> = ({
  priceRecords,
  navigation,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Price Records ({priceRecords.length})
      </Text>
      {priceRecords.length > 0 ? (
        <ScrollView style={styles.recordsContainer}>
          {priceRecords.map((record) => (
            <TouchableOpacity
              key={record.id}
              style={styles.recordItem}
              onPress={() =>
                navigation.navigate("PriceRecordInformation", {
                  recordId: record.id,
                })
              }
            >
              <View style={styles.recordLeftSection}>
                <View style={styles.storeCircle} />
                <View style={styles.recordInfo}>
                  <Text style={styles.storeName} numberOfLines={1}>
                    {record.store?.name || "Unknown Store"}
                  </Text>
                  <Text style={styles.recordDate}>
                    {formatRecordDateTime(record.recorded_at)}
                  </Text>
                </View>
              </View>
              <Text style={styles.recordPrice}>
                ${parseFloat(record.original_price).toFixed(2)}/
                {record.original_quantity}
                {record.original_unit}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Text>No price records available</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 15,
    marginBottom: 10,
  },
  recordsContainer: {
    maxHeight: 200,
  },
  recordItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  recordLeftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  storeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ddd",
    marginRight: 10,
  },
  recordInfo: {
    flex: 1,
    marginRight: 10,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "500",
  },
  recordDate: {
    fontSize: 14,
    color: "#666",
  },
  recordPrice: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.primary,
  },
});
