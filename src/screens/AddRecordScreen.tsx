import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TextInput,
  Button,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { globalStyles } from "../theme/styles";
import { colors } from "../theme/colors";
import { UNITS, ALL_UNITS } from "../constants/units";
import DropDownPicker from "react-native-dropdown-picker";

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
        <Text style={styles.title}>Log New Price</Text>
        <View style={styles.imageContainer}></View>
        <TextInput
          style={globalStyles.input}
          placeholder="Product Name"
          value={productName}
          onChangeText={setProductName}
        />
        <TextInput
          style={globalStyles.input}
          placeholder="Store Name"
          value={storeName}
          onChangeText={setStoreName}
        />
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
        <View style={globalStyles.twoButtonsContainer}>
          <TouchableOpacity style={[globalStyles.button, globalStyles.primaryButton]}>
            <Text style={globalStyles.primaryButtonText}>Add More</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[globalStyles.button, globalStyles.primaryButton]}>
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
    padding: 30,
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
    backgroundColor: "pink",
    marginBottom: 20,
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
});
