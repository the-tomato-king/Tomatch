import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { globalStyles } from "../theme/styles";
import { colors } from "../theme/colors";
import { UNITS, ALL_UNITS } from "../constants/units";
import DropDownPicker from "react-native-dropdown-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const AddRecordScreen = () => {
  const [productName, setProductName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [price, setPrice] = useState("");
  const [unitType, setUnitType] = useState(UNITS.WEIGHT.LB);
  const [photoUrl, setPhotoUrl] = useState("");

  // state for DropDownPicker
  const [open, setOpen] = useState(false);
  const [items] = useState(
    ALL_UNITS.map((unit) => ({
      label: unit,
      value: unit,
    }))
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.imageContainer}>
          <View style={styles.imageContent}>
            <View style={styles.cameraIconContainer}>
              <MaterialCommunityIcons
                name="camera-plus-outline"
                size={40}
                color={colors.mediumGray}
              />
            </View>
            <Text style={styles.uploadText}>Click to add photo</Text>
          </View>
        </TouchableOpacity>
        <View style={globalStyles.inputsContainer}>
          <View style={globalStyles.inputContainer}>
            <Text style={globalStyles.inputLabel}>Product Name</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Product Name"
              value={productName}
              onChangeText={setProductName}
            />
          </View>
          <View style={globalStyles.inputContainer}>
            <Text style={globalStyles.inputLabel}>Store Name</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Store Name"
              value={storeName}
              onChangeText={setStoreName}
            />
          </View>
          <View style={globalStyles.inputContainer}>
            <Text style={globalStyles.inputLabel}>Price</Text>
            <View style={styles.priceContainer}>
              <TextInput
                style={[styles.priceInput, globalStyles.input]}
                placeholder="Price"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
              <DropDownPicker
                open={open}
                value={unitType}
                items={items}
                setOpen={setOpen}
                setValue={setUnitType}
                style={[styles.unitPicker, globalStyles.input]}
                containerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                maxHeight={200}
              />
            </View>
          </View>
        </View>
        <View style={[globalStyles.twoButtonsContainer, { marginTop: 10 }]}>
          <TouchableOpacity
            style={[globalStyles.button, globalStyles.primaryButton]}
          >
            <Text style={globalStyles.primaryButtonText}>Add More</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[globalStyles.button, globalStyles.primaryButton]}
          >
            <Text style={globalStyles.primaryButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddRecordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  cardContainer: {
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  imageContainer: {
    width: "100%",
    height: 200,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.mediumGray,
    borderRadius: 8,
    marginVertical: 40,
  },
  imageContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceInput: {
    flex: 1,
  },
  unitPicker: {
    borderColor: colors.mediumGray,
  },
  dropdownContainer: {
    width: 100,
  },
  dropdownText: {
    fontSize: 16,
  },
  cameraIconContainer: {
    transform: [{ scaleX: 1.2 }],
    marginBottom: 15,
  },
  uploadText: {
    color: colors.darkGray,
    fontSize: 16,
  },
});
