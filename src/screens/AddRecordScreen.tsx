import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Button,
} from "react-native";
import React, { useState } from "react";
import { globalStyles } from "../theme/styles";
import { colors } from "../theme/colors";
const AddRecordScreen = () => {
  const [productName, setProductName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [price, setPrice] = useState("");
  const [unitType, setUnitType] = useState("/lb");
  const [photoUrl, setPhotoUrl] = useState("");
  const [recordedAt, setRecordedAt] = useState(new Date());

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
            placeholder="0.00"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity style={[styles.unitButton, globalStyles.input]}>
            <Text>{unitType}</Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={globalStyles.input}
          placeholder="Photo URL"
          value={photoUrl}
          onChangeText={setPhotoUrl}
        />
        <TextInput style={globalStyles.input} placeholder="Recorded At" />
        <Button title="Add More" />
        <Button title="Save" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddRecordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 16,
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
  unitButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: 80,
  },
  dropdownIcon: {
    fontSize: 12,
  },
});
