import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import React, { useState, useLayoutEffect, useEffect } from "react";
import { globalStyles } from "../../theme/styles";
import { colors } from "../../theme/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import { PRODUCT_CATEGORIES } from "../../data/Product";
import SearchDropdown from "../../components/SearchDropdown";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  createDoc,
  readOneDoc,
  updateOneDocInDB,
} from "../../services/firebase/firebaseHelper";
import { COLLECTIONS } from "../../constants/firebase";
import { Product } from "../../types";
import LoadingLogo from "../../components/LoadingLogo";

const AddProductScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const isEditMode = route.name === "EditProduct";
  const productId = isEditMode ? route.params?.productId : null;

  const [loading, setLoading] = useState(isEditMode);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [items] = useState(
    Object.values(PRODUCT_CATEGORIES).map((category) => ({
      label: category,
      value: category,
    }))
  );

  const [name, setName] = useState("");
  const [pluCode, setPluCode] = useState("");

  // 获取产品数据
  useEffect(() => {
    if (isEditMode && productId) {
      const fetchProductData = async () => {
        try {
          setLoading(true);
          const productData = await readOneDoc<Product>(
            COLLECTIONS.PRODUCTS,
            productId
          );
          if (productData) {
            setName(productData.name);
            setCategory(productData.category);
            setPluCode(productData.plu_code || "");
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          Alert.alert("Error", "Failed to load product data");
        } finally {
          setLoading(false);
        }
      };
      fetchProductData();
    }
  }, [isEditMode, productId]);

  const handleSave = async () => {
    try {
      if (!name || !category) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
      }

      const productData = {
        name,
        category,
        plu_code: pluCode,
        updated_at: new Date(),
      };

      if (isEditMode) {
        await updateOneDocInDB(COLLECTIONS.PRODUCTS, productId, productData);
        Alert.alert("Success", "Product updated successfully!");
      } else {
        productData.updated_at = new Date();
        const newProductId = await createDoc(COLLECTIONS.PRODUCTS, productData);
        if (!newProductId) {
          throw new Error("Failed to create product");
        }
        Alert.alert("Success", "Product created successfully!");
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error saving product:", error);
      Alert.alert(
        "Error",
        `Failed to ${isEditMode ? "update" : "create"} product`
      );
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Text style={globalStyles.headerButton} onPress={handleSave}>
          Save
        </Text>
      ),
    });
  }, [navigation, handleSave]);

  if (loading) {
    return <LoadingLogo />;
  }

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
              value={name}
              onChangeText={setName}
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
              value={pluCode}
              onChangeText={setPluCode}
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
