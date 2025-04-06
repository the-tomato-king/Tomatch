import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useState } from "react";
import { globalStyles } from "../../theme/styles";
import { colors } from "../../theme/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import { PRODUCT_CATEGORIES } from "../../data/Product";
import CategorySearchInput from "../../components/CategorySearchInput";
import SearchDropdown from "../../components/SearchDropdown";

const AddProductScreen = () => {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [items] = useState(
    Object.values(PRODUCT_CATEGORIES).map((category) => ({
      label: category,
      value: category,
    }))
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cardContainer}>
        {/* Picture */}
        <TouchableOpacity style={styles.imageContainer}>
          <View style={styles.imageContent}>
            <View style={styles.cameraIconContainer}>
              <MaterialCommunityIcons
                name="camera-plus-outline"
                size={80}
                color={colors.mediumGray}
              />
            </View>
            <Text style={styles.uploadText}>Click to take photo</Text>
          </View>
        </TouchableOpacity>

        {/* Inputs */}
        <View style={globalStyles.inputsContainer}>
          {/* Product Name */}
          <View style={globalStyles.inputContainer}>
            <View style={globalStyles.labelContainer}>
              <Text style={globalStyles.inputLabel}>Name</Text>
            </View>
            <TextInput
              style={globalStyles.input}
              placeholder="Enter product name"
            />
          </View>

          {/* Category */}
          <SearchDropdown
            label="Category"
            value={category}
            items={Object.values(PRODUCT_CATEGORIES).map((category) => ({
              label: category,
              value: category,
            }))}
            onChangeValue={setCategory}
            placeholder="Select category"
          />

          {/* PLU Code */}
          <View style={globalStyles.inputContainer}>
            <View style={globalStyles.labelContainer}>
              <Text style={globalStyles.inputLabel}>PLU</Text>
            </View>
            <TextInput
              style={globalStyles.input}
              placeholder="Enter PLU code"
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddProductScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  cardContainer: {
    paddingHorizontal: 30,
  },
  imageContainer: {
    width: "100%",
    height: 180,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.mediumGray,
    borderRadius: 8,
    marginVertical: 20,
  },
  imageContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIconContainer: {
    marginBottom: 15,
  },
  uploadText: {
    color: colors.darkGray,
    fontSize: 16,
  },
  dropdown: {
    backgroundColor: colors.lightGray2,
    borderWidth: 0,
    borderRadius: 8,
    minHeight: 48,
  },
  dropdownContainer: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray2,
    borderRadius: 8,
  },
});
