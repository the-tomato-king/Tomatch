import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState, useLayoutEffect } from "react";
import { globalStyles } from "../theme/styles";
import { colors } from "../theme/colors";
import { UNITS, ALL_UNITS } from "../constants/units";
import DropDownPicker from "react-native-dropdown-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  requestMediaLibraryPermissionsAsync,
  launchImageLibraryAsync,
} from "expo-image-picker";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

import { createDoc } from "../services/firebase/firebaseHelper";
import { COLLECTIONS } from "../constants/firebase";
import { PriceRecord, UserProduct, ProductStats } from "../types";
import ProductSearchInput from "../components/ProductSearchInput";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../services/firebase/firebaseConfig";

type AddRecordScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const AddRecordScreen = () => {
  const navigation = useNavigation<AddRecordScreenNavigationProp>();
  const [selectedProduct, setSelectedProduct] = useState<UserProduct>();

  const [image, setImage] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [price, setPrice] = useState("");
  const [unitType, setUnitType] = useState(UNITS.WEIGHT.LB);

  // state for DropDownPicker
  const [open, setOpen] = useState(false);
  const [items] = useState(
    ALL_UNITS.map((unit) => ({
      label: unit,
      value: unit,
    }))
  );

  const pickImage = async () => {
    try {
      const permissionResult = await requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        alert("You need to enable permission to access the photo library!");
        return;
      }

      const result = await launchImageLibraryAsync({
        mediaTypes: "images",
        quality: 0.2,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      alert("Failed to pick image");
    }
  };

  const handleSave = async () => {
    try {
      // verify
      if (!productName || !storeName || !price || !unitType) {
        alert("Please fill in all required fields");
        return;
      }

      const numericPrice = parseFloat(price);
      if (isNaN(numericPrice)) {
        alert("Please enter a valid price");
        return;
      }

      if (!selectedProduct) {
        alert("Please select a product from the list");
        return;
      }

      // TODO: Link to real user, now hardcoded to user123
      const userId = "user123";
      const userPath = `${COLLECTIONS.USERS}/${userId}`;

      // Check if user already has this product
      const userProductsRef = collection(
        db,
        COLLECTIONS.USERS,
        userId,
        COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS
      );

      const querySnapshot = await getDocs(userProductsRef);
      const existingUserProduct = querySnapshot.docs.find(
        (doc) => doc.data().product_id === selectedProduct.product_id
      );

      let userProductId;
      if (existingUserProduct) {
        // If product exists, use its ID directly
        userProductId = existingUserProduct.id;
      } else {
        // create user product if it doesn't exist
        const userProduct: UserProduct = {
          id: "", // Firebase will generate this
          product_id: selectedProduct.product_id,
          created_at: new Date(),
          updated_at: new Date(),
        };

        const userProductPath = `${userPath}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;
        userProductId = await createDoc(userProductPath, userProduct);

        if (!userProductId) {
          alert("Failed to save user product");
          return;
        }
      }

      const priceRecord: PriceRecord = {
        id: "", // Firebase will generate this
        user_product_id: userProductId,
        store_id: storeName, // TODO: Link to real store, now use the store name user typed in
        price: numericPrice,
        unit_type: unitType,
        unit_price: numericPrice, //TODO: Calculate unit price, now same as price
        photo_url: image || "",
        recorded_at: new Date(),
      };

      const priceRecordPath = `${userPath}/${COLLECTIONS.SUB_COLLECTIONS.PRICE_RECORDS}`;
      const recordId = await createDoc(priceRecordPath, priceRecord);

      if (recordId) {
        const productStatsRef = doc(
          db,
          COLLECTIONS.PRODUCT_STATS,
          selectedProduct.product_id
        );
        const productStatsDoc = await getDoc(productStatsRef);

        let productStats: ProductStats;

        if (productStatsDoc.exists()) {
          productStats = productStatsDoc.data() as ProductStats;

          const newTotalRecords = productStats.total_price_records + 1;
          const newTotalPrice = productStats.total_price + numericPrice;
          const newAveragePrice = newTotalPrice / newTotalRecords;

          if (numericPrice < productStats.lowest_price) {
            productStats.lowest_price = numericPrice;
            productStats.lowest_price_store = {
              store_id: storeName,
              store_name: storeName,
            };
          }

          if (numericPrice > productStats.highest_price) {
            productStats.highest_price = numericPrice;
          }

          productStats.total_price = newTotalPrice;
          productStats.average_price = newAveragePrice;
          productStats.total_price_records = newTotalRecords;
          productStats.last_updated = new Date();

          await updateDoc(productStatsRef, {
            total_price: productStats.total_price,
            average_price: productStats.average_price,
            lowest_price: productStats.lowest_price,
            highest_price: productStats.highest_price,
            lowest_price_store: productStats.lowest_price_store,
            total_price_records: productStats.total_price_records,
            last_updated: productStats.last_updated,
          });
        } else {
          productStats = {
            id: "", // Firebase will generate this
            product_id: selectedProduct.product_id,
            currency: "$", // TODO: Get from user settings
            total_price: numericPrice,
            average_price: numericPrice,
            lowest_price: numericPrice,
            highest_price: numericPrice,
            lowest_price_store: {
              store_id: storeName,
              store_name: storeName,
            },
            total_price_records: 1,
            last_updated: new Date(),
          };

          await setDoc(productStatsRef, productStats);
        }

        alert("Record saved successfully!");
        navigation.goBack();
      } else {
        alert("Failed to save record");
      }
    } catch (error) {
      console.error("Error saving record:", error);
      alert("Failed to save record");
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cardContainer}>
        {image ? (
          <TouchableOpacity
            style={[
              styles.imageContainer,
              { borderWidth: 1, borderStyle: "solid" },
            ]}
            onPress={pickImage}
          >
            <Image source={{ uri: image }} style={styles.previewImage} />
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
              <View style={styles.imageContent}>
                <View style={styles.cameraIconContainer}>
                  <MaterialCommunityIcons
                    name="camera-plus-outline"
                    size={80}
                    color={colors.mediumGray}
                  />
                </View>
                <Text style={styles.uploadText}>Click to add photo</Text>
              </View>
            </TouchableOpacity>
          </>
        )}
        <View style={globalStyles.inputsContainer}>
          <ProductSearchInput
            inputValue={productName}
            onChangeInputValue={setProductName}
            onSelectProduct={(product) => {
              setProductName(product.name);
              setSelectedProduct({
                id: "", // Firebase will generate this
                product_id: product.id,
                created_at: new Date(),
                updated_at: new Date(),
              });
            }}
          />
          <View style={globalStyles.inputContainer}>
            <View style={globalStyles.labelContainer}>
              <Text style={globalStyles.inputLabel}>Store</Text>
            </View>
            <TextInput
              style={globalStyles.input}
              placeholder="Select store..."
              value={storeName}
              onChangeText={setStoreName}
            />
          </View>
          <View style={[globalStyles.inputContainer]}>
            <View style={globalStyles.labelContainer}>
              <Text style={globalStyles.inputLabel}>Price</Text>
            </View>
            <View
              style={[styles.priceContainer, { backgroundColor: colors.white }]}
            >
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={[globalStyles.input, styles.priceInput]}
                  placeholder="0.00"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.unitContainer}>
                <DropDownPicker
                  open={open}
                  value={unitType}
                  items={items}
                  setOpen={setOpen}
                  setValue={setUnitType}
                  style={styles.unitPicker}
                  containerStyle={styles.dropdownContainer}
                  textStyle={{ fontSize: 16 }}
                  dropDownContainerStyle={{
                    backgroundColor: colors.white,
                    borderWidth: 1,
                    borderColor: colors.lightGray2,
                  }}
                  maxHeight={200}
                />
              </View>
            </View>
          </View>
        </View>
        <View style={[globalStyles.buttonsContainer, { marginTop: 20 }]}>
          <TouchableOpacity
            style={[globalStyles.button, globalStyles.primaryButton]}
          >
            <Text style={globalStyles.primaryButtonText}>Add More</Text>
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
  priceContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGray2,
    borderEndEndRadius: 8,
    borderStartEndRadius: 8,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    color: colors.darkText,
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 0,
    minHeight: 48,
    paddingHorizontal: 0,
  },
  unitContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  perText: {
    fontSize: 16,
    color: colors.darkText,
  },
  unitPicker: {
    backgroundColor: colors.lightGray2,
    borderWidth: 0,
    minHeight: 48,
    paddingHorizontal: 12,
    width: 80,
    zIndex: 1,
  },
  dropdownContainer: {
    width: 80,
    zIndex: 1,
  },
  cameraIconContainer: {
    marginBottom: 15,
  },
  uploadText: {
    color: colors.darkGray,
    fontSize: 16,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
});
