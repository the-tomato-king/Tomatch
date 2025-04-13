import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { formatRecordDateTime } from "../../utils/dateUtils";
import { PriceRecord } from "../../types";
import { colors } from "../../theme/colors";
import { PriceDisplay } from "../PriceDisplay";
import { isCountUnit } from "../../constants/units";
import { useUserPreference } from "../../hooks/useUserPreference";
import { useAuth } from "../../contexts/AuthContext";
import { UNITS } from "../../constants/units";

interface ProductPriceRecordListProps {
  priceRecords: PriceRecord[];
  navigation: any;
}

export const ProductPriceRecordList: React.FC<ProductPriceRecordListProps> = ({
  priceRecords,
  navigation,
}) => {
  const { userId } = useAuth();
  const { preferences } = useUserPreference(userId as string);

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
              <View style={styles.priceContainer}>
                <PriceDisplay
                  standardPrice={parseFloat(record.standard_unit_price)}
                  measurementType={
                    isCountUnit(record.original_unit) ? "count" : "measurable"
                  }
                />
                <Text style={styles.unitText}>
                  /
                  {isCountUnit(record.original_unit)
                    ? UNITS.COUNT.EACH
                    : preferences?.unit}
                </Text>
              </View>
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
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  unitText: {
    fontSize: 14,
    color: colors.secondaryText,
    marginLeft: 2,
  },
});
