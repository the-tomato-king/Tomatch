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
        <View style={styles.imageContainer}>

        </View>
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
        <TextInput
          style={globalStyles.input}
          placeholder="Price"
          value={price}
          onChangeText={setPrice}
        />
        <TextInput
          style={globalStyles.input}
          placeholder="Photo URL"
          value={photoUrl}
          onChangeText={setPhotoUrl}
        />
        <TextInput
          style={globalStyles.input}
          placeholder="Recorded At"
        />
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
});
