import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  ActionSheetIOS,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import React, { useEffect, useState, useLayoutEffect } from "react";
import { globalStyles } from "../../theme/styles";
import { colors } from "../../theme/colors";
import { UNITS, ALL_UNITS } from "../../constants/units";
import DropDownPicker from "react-native-dropdown-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  requestMediaLibraryPermissionsAsync,
  requestCameraPermissionsAsync,
  launchImageLibraryAsync,
  launchCameraAsync,
} from "expo-image-picker";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, HomeStackParamList } from "../../types/navigation";
import { COLLECTIONS } from "../../constants/firebase";
import { BasePriceRecord, Product, UserProduct, UserStore } from "../../types";
import ProductSearchInput from "../../components/search/ProductSearchInput";
import StoreSearchInput from "../../components/search/StoreSearchInput";
import LoadingLogo from "../../components/loading/LoadingLogo";
import { analyzeReceiptImage } from "../../services/openai/openaiService";
import AILoadingScreen from "../../components/loading/AILoadingScreen";
import {
  getProductById,
  getAllProducts,
} from "../../services/productLibraryService";
import { useAuth } from "../../contexts/AuthContext";
import {
  getPriceRecord,
  createPriceRecord,
  updatePriceRecord,
} from "../../services/priceRecordService";
import {
  createUserProduct,
  BasicProductData,
} from "../../services/userProductService";
import { Unit } from "../../constants/units";
import {
  uploadProductImage,
  deleteProductImage,
} from "../../services/mediaService";
import {
  findUserProductByName,
  findUserProductByLibraryId,
} from "../../services/userProductService";
import { updateUserProductStats } from "../../services/userProductService";
import { getUserProductById } from "../../services/userProductService";
import { getUserStoreById } from "../../services/userStoreService";
import { calculateStandardPrice } from "../../utils/unitConverter";
import { useUserPreference } from "../../hooks/useUserPreference";
import ImagePreview from "../../components/ImagePreview";
import UnitInputGroup from "../../components/inputs/UnitInputGroup";

type AddRecordScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

type EditRecordScreenRouteProp = RouteProp<
  HomeStackParamList,
  "EditPriceRecord"
>;

interface ProductState {
  selectedProduct: Product | null;
  productName: string;
}

const AddRecordScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userId } = useAuth();
  const { preferences, getCurrencySymbol } = useUserPreference(
    userId as string
  );

  const isEditMode = route.name === "EditPriceRecord";
  const recordId = isEditMode ? route.params?.recordId : null;

  const [loading, setLoading] = useState(isEditMode);
  const [productState, setProductState] = useState<ProductState>({
    selectedProduct: null,
    productName: "",
  });
  const [selectedStore, setSelectedStore] = useState<UserStore>();
  const [image, setImage] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("");
  const [price, setPrice] = useState("");
  const [unitType, setUnitType] = useState<string>(UNITS.WEIGHT.LB);
  const [unitValue, setUnitValue] = useState("");

  // state for DropDownPicker
  const [open, setOpen] = useState(false);
  const [items] = useState(
    ALL_UNITS.map((unit) => ({
      label: unit,
      value: unit,
    }))
  );

  const [isAILoading, setIsAILoading] = useState(false);

  // fetch record data if in edit mode
  useEffect(() => {
    if (isEditMode && recordId && userId) {
      const loadRecordData = async () => {
        try {
          setLoading(true);
          const recordData = await getPriceRecord(userId, recordId);

          if (recordData) {
            setPrice(recordData.original_price);
            setUnitType(recordData.original_unit);
            if (recordData.photo_url) {
              setImage(recordData.photo_url);
            }

            if (recordData.user_product_id) {
              const userProductData = await getUserProductById(
                userId,
                recordData.user_product_id
              );

              if (userProductData) {
                // set product name
                setProductState({
                  selectedProduct: null, // set null if need library product
                  productName: userProductData.name, // use user product name directly
                });

                // if has product_id, try to get library product
                if (userProductData.product_id) {
                  try {
                    const productData = await getProductById(
                      userProductData.product_id
                    );
                    if (productData) {
                      setProductState((prev) => ({
                        selectedProduct: productData,
                        productName: productData.name,
                      }));
                    }
                  } catch (error) {
                    console.error("Error loading library product:", error);
                  }
                }
              }
            }

            if (recordData.store_id) {
              const storeData = await getUserStoreById(
                userId,
                recordData.store_id
              );
              if (storeData) {
                setStoreName(storeData.name);
                setSelectedStore(storeData);
              }
            }
          }
        } catch (error) {
          console.error("Error loading record:", error);
          Alert.alert("Error", "Failed to load record data");
        } finally {
          setLoading(false);
        }
      };

      loadRecordData();
    }
  }, [isEditMode, recordId, userId]);

  // Add this useEffect to sync productName and selectedProduct
  useEffect(() => {
    // If productName changes and doesn't match selectedProduct.name, clear selectedProduct
    if (
      productState.selectedProduct &&
      productState.productName !== productState.selectedProduct.name &&
      productState.productName.trim() !== ""
    ) {
      // User has edited the product name after selecting a product
      setProductState({
        selectedProduct: null,
        productName: "",
      });
    }
  }, [productState.productName]);

  // Modify the ProductSearchInput onChangeInputValue callback
  // to include this logic directly when text changes
  const handleProductNameChange = (text: string) => {
    setProductState({
      selectedProduct: null,
      productName: text,
    });
  };

  const handleProductSelect = (product: Product) => {
    setProductState({
      selectedProduct: product,
      productName: product.name,
    });
  };

  const handleNavigateToLibrary = () => {
    navigation.navigate("ProductLibrary", {
      onSelectProduct: handleProductSelect,
      initialSearchText: productState.productName,
    });
  };

  const analyzeImageAndFillForm = async (
    imageUri: string,
    base64Data: string | undefined
  ) => {
    try {
      setIsAILoading(true);

      if (!base64Data) {
        throw new Error("Base64 image data required for analysis");
      }

      const receiptData = await analyzeReceiptImage(base64Data);

      // auto fill form
      if (receiptData.productName) {
        setProductState({
          selectedProduct: null,
          productName: receiptData.productName,
        });
      }
      if (receiptData.priceValue) {
        setPrice(receiptData.priceValue);
      }
      if (receiptData.unitValue) {
        setUnitValue(receiptData.unitValue);
      }
      if (receiptData.unitType) {
        // check if unit is in allowed units list
        const validUnit = ALL_UNITS.find(
          (unit) => unit.toLowerCase() === receiptData.unitType?.toLowerCase()
        );
        if (validUnit) {
          setUnitType(validUnit);
        }
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      Alert.alert(
        "Error",
        "Failed to analyze receipt image. Check console for details."
      );
    } finally {
      setIsAILoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        alert("Need camera permission to take photo");
        return;
      }

      const result = await launchCameraAsync({
        mediaTypes: "images",
        quality: 0.2,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        // only preview the image
        setImage(result.assets[0].uri);

        // AI analysis
        if (result.assets[0].base64) {
          await analyzeImageAndFillForm(
            result.assets[0].uri,
            result.assets[0].base64
          );
        }
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      alert("Failed to take photo");
    }
  };

  const pickFromLibrary = async () => {
    try {
      const permissionResult = await requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        alert("Need photo library permission to select photo");
        return;
      }

      const result = await launchImageLibraryAsync({
        mediaTypes: "images",
        quality: 0.2,
        base64: true, // Add base64 support for image library selection
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
        await analyzeImageAndFillForm(
          result.assets[0].uri,
          result.assets[0].base64 || ""
        );
      }
    } catch (error) {
      console.error("Error selecting photo:", error);
      alert("Failed to select photo");
    }
  };

  const handleImagePress = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Library"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickFromLibrary();
          }
        }
      );
    } else {
      Alert.alert(
        "Change Photo",
        "Choose photo source",
        [
          {
            text: "Take Photo",
            onPress: takePhoto,
          },
          {
            text: "Choose from Library",
            onPress: pickFromLibrary,
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
        { cancelable: true }
      );
    }
  };

  // Validates basic form inputs
  const validateFormInputs = () => {
    if (!productState.productName || !storeName || !price || !unitType) {
      alert("Please fill in all required fields");
      return false;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) {
      alert("Please enter a valid price");
      return false;
    }

    if (!selectedStore) {
      alert("Please select a store from the list");
      return false;
    }

    return numericPrice;
  };

  // Creates a product if none is selected
  const getOrCreateUserProduct = async (
    userId: string,
    numericPrice: number
  ) => {
    const userProductPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;

    if (productState.selectedProduct) {
      // first check if the product already exists
      const existingProductByName = await findUserProductByName(
        userId,
        productState.selectedProduct.name
      );
      if (existingProductByName) {
        return existingProductByName;
      }

      // if no same name, check product_id
      const existingProductByProductId = await findUserProductByLibraryId(
        userId,
        productState.selectedProduct.id
      );
      if (existingProductByProductId) {
        return existingProductByProductId;
      }

      // if no match, create new
      const productData: BasicProductData = {
        name: productState.selectedProduct.name,
        category: productState.selectedProduct.category || "",
        image_type: productState.selectedProduct.image_type,
        image_source: productState.selectedProduct.image_source,
        plu_code: productState.selectedProduct.plu_code || "",
        barcode: productState.selectedProduct.barcode || "",
      };

      const userProductId = await createUserProduct({
        userId,
        productData,
        localImageUri: image || undefined,
      });

      return {
        id: userProductId,
        ...productData,
      } as UserProduct & { id: string };
    } else if (productState.productName) {
      // if manual input product name
      // first check if the product already exists
      const existingProduct = await findUserProductByName(
        userId,
        productState.productName
      );
      if (existingProduct) {
        return existingProduct;
      }

      // if no same name, check if match library product
      const allProducts = getAllProducts();
      const matchingProduct = allProducts.find(
        (product) =>
          product.name.toLowerCase() === productState.productName.toLowerCase()
      );

      if (matchingProduct) {
        // if match library product, create corresponding user product
        return {
          product_id: matchingProduct.id,
          name: matchingProduct.name,
          category: matchingProduct.category || "",
          image_type: matchingProduct.image_type || "emoji",
          image_source: matchingProduct.image_source || "",
          plu_code: matchingProduct.plu_code || "",
          barcode: matchingProduct.barcode || "",
          total_price: 0,
          average_price: 0,
          lowest_price: 0,
          highest_price: 0,
          lowest_price_store: {
            store_id: "",
            store_name: "",
          },
          total_price_records: 0,
          created_at: new Date(),
          updated_at: new Date(),
        };
      }

      // if no match, create new custom product
      const productData: BasicProductData = {
        name: productState.productName,
        category: "",
        image_type: image ? "user_image" : "emoji",
        image_source: "",
        plu_code: "",
        barcode: "",
      };

      const userProductId = await createUserProduct({
        userId,
        productData,
        localImageUri: image || undefined,
      });

      return {
        id: userProductId,
        ...productData,
      } as UserProduct & { id: string };
    }
    return null;
  };

  // Creates or updates a price record
  const savePriceRecord = async (
    userId: string,
    userProductId: string,
    numericPrice: number,
    photoUrl: string,
    standardUnitPrice: number
  ) => {
    if (isEditMode && recordId) {
      // Update existing record
      const updatedRecord = {
        original_price: numericPrice.toString(),
        original_quantity: unitValue || "1",
        original_unit: unitType as Unit,
        photo_url: photoUrl || "",
        store_id: selectedStore!.id,
        standard_unit_price: standardUnitPrice.toString(),
      };

      const success = await updatePriceRecord(userId, recordId, updatedRecord);
      return { success, recordId: recordId };
    } else {
      // Create new price record
      const priceRecord: BasePriceRecord = {
        user_product_id: userProductId,
        store_id: selectedStore!.id,
        original_price: numericPrice.toString(),
        original_quantity: unitValue || "1",
        original_unit: unitType as Unit,
        standard_unit_price: standardUnitPrice.toString(),
        photo_url: photoUrl,
        recorded_at: new Date(),
      };

      const newRecordId = await createPriceRecord(userId, priceRecord);
      return { success: !!newRecordId, recordId: newRecordId };
    }
  };

  // Updates product statistics after adding a record
  const updateProductStats = async (
    userId: string,
    userProductId: string,
    numericPrice: number,
    standardUnitPrice: number
  ) => {
    return await updateUserProductStats(
      userId,
      userProductId,
      numericPrice,
      {
        id: selectedStore!.id,
        name: selectedStore!.name,
      },
      unitType === UNITS.COUNT.EACH ? "count" : "measurable",
      standardUnitPrice
    );
  };

  const handleSave = async () => {
    let uploadedImagePath: string | null = null;

    try {
      // Validate form inputs
      const numericPrice = validateFormInputs();
      if (!numericPrice) return;

      const userPath = `${COLLECTIONS.USERS}/${userId}`;

      // Upload image if exists
      let photoUrl = "";
      if (image) {
        const result = await uploadProductImage(userId as string, image);
        photoUrl = result.url;
        uploadedImagePath = result.path; // Store the path for potential rollback
      }

      // Get or create user product
      const userProduct = await getOrCreateUserProduct(
        userId as string,
        numericPrice
      );
      if (!userProduct) {
        alert("Failed to process product information");
        return;
      }

      const userProductPath = `${userPath}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;
      let userProductId;

      // check if the user product already exists
      if ("id" in userProduct) {
        // if existing user product, use its id
        userProductId = userProduct.id;
      } else {
        // if new user product, create it
        userProductId = await createUserProduct({
          userId: userId as string,
          productData: {
            name: userProduct.name,
            category: userProduct.category,
            image_type: userProduct.image_type,
            plu_code: userProduct.plu_code,
            image_source: userProduct.image_source,
            barcode: userProduct.barcode,
          },
          localImageUri: image || undefined,
        });
      }

      if (!userProductId) {
        alert("Failed to save user product");
        return;
      }

      // calculate standard unit price
      const standardUnitPrice = calculateStandardPrice(
        numericPrice,
        parseFloat(unitValue || "1"),
        unitType as Unit
      );

      // Save price record
      const { success, recordId } = await savePriceRecord(
        userId as string,
        userProductId as string,
        numericPrice,
        photoUrl,
        standardUnitPrice
      );

      if (success) {
        // update product stats
        if (!isEditMode) {
          await updateProductStats(
            userId as string,
            userProductId as string,
            numericPrice,
            standardUnitPrice
          );
        }

        alert(
          isEditMode
            ? "Record updated successfully!"
            : "Record saved successfully!"
        );
        navigation.goBack();
      } else {
        alert("Failed to save record");
      }
    } catch (error) {
      // If image was uploaded but later steps failed, clean up the uploaded image
      if (uploadedImagePath) {
        try {
          await deleteProductImage(uploadedImagePath);
        } catch (cleanupError) {
          console.error("Error cleaning up uploaded image:", cleanupError);
        }
      }

      console.error("Error saving record:", error);
      Alert.alert("Error", "Failed to save record");
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Text style={globalStyles.headerButton} onPress={handleSave}>
          {isEditMode ? "Update" : "Save"}
        </Text>
      ),
    });
  }, [navigation, handleSave, isEditMode]);

  if (loading) {
    return <LoadingLogo />;
  }

  if (isAILoading) {
    return <AILoadingScreen />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <View style={styles.cardContainer}>
            {image ? (
              <View style={styles.imageContainer}>
                <ImagePreview
                  source={image}
                  height={180}
                  containerStyle={styles.previewImage}
                />
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleImagePress}
                >
                  <MaterialCommunityIcons
                    name="pencil"
                    size={20}
                    color={colors.white}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.imageContainer, styles.emptyImageContainer]}
                onPress={handleImagePress}
              >
                <View style={styles.imageContent}>
                  <View style={styles.cameraIconContainer}>
                    <MaterialCommunityIcons
                      name="camera-plus-outline"
                      size={80}
                      color={colors.mediumGray}
                    />
                  </View>
                  <Text style={styles.uploadText}>
                    Take photo and auto-fill
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            <View style={globalStyles.inputsContainer}>
              <ProductSearchInput
                value={productState.productName}
                selectedProduct={productState.selectedProduct}
                onChangeText={handleProductNameChange}
                onSelectProduct={handleProductSelect}
                onNavigateToLibrary={handleNavigateToLibrary}
              />
              {/* TODO: replace with general search dropdown */}
              <StoreSearchInput
                inputValue={storeName}
                onChangeInputValue={setStoreName}
                onSelectStore={(store) => {
                  setSelectedStore(store);
                }}
                initialStoreId={selectedStore?.id}
                disabled={false}
              />
              <View style={[globalStyles.inputContainer]}>
                <View style={globalStyles.labelContainer}>
                  <MaterialCommunityIcons
                    name="alpha-s-circle"
                    size={18}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.priceContainer}>
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.currencySymbol}>
                      {getCurrencySymbol(preferences?.currency || "USD")}
                    </Text>
                    <TextInput
                      style={[globalStyles.input, styles.priceInput]}
                      placeholder="0.00"
                      placeholderTextColor={colors.secondaryText}
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <UnitInputGroup
                    unitValue={unitValue}
                    unitType={unitType}
                    onUnitValueChange={setUnitValue}
                    onUnitTypeChange={setUnitType}
                  />
                </View>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    paddingBottom: 30,
  },
  imageContainer: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginVertical: 20,
  },
  emptyImageContainer: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.mediumGray,
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
    gap: 4,
  },
  priceInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGray2,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
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
  editButton: {
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
