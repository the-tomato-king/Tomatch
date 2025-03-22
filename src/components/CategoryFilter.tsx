import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { colors } from "../theme/colors";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  showAllOption?: boolean;
  allOptionLabel?: string;
}

const CategoryFilter = ({
  categories,
  selectedCategory,
  onSelectCategory,
  showAllOption = true,
  allOptionLabel = "All",
}: CategoryFilterProps) => {
  return (
    <View style={styles.categoryFilterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {showAllOption && (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === "all" && styles.selectedCategoryButton,
            ]}
            onPress={() => onSelectCategory("all")}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === "all" && styles.selectedCategoryText,
              ]}
            >
              {allOptionLabel}
            </Text>
          </TouchableOpacity>
        )}

        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategoryButton,
            ]}
            onPress={() => onSelectCategory(category)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.selectedCategoryText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default CategoryFilter;

const styles = StyleSheet.create({
  categoryFilterContainer: {
    width: "100%",
    height: 40,
    borderBottomWidth: 2,
    borderBottomColor: colors.lightGray2,
  },
  categoryButton: {
    paddingHorizontal: 20,
    height: "100%",
    justifyContent: "center",
  },
  selectedCategoryButton: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.secondaryText,
    textAlign: "center",
  },
  selectedCategoryText: {
    color: colors.primary,
    fontWeight: "700",
  },
});
