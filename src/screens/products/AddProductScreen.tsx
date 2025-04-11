import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from "react-native";
import React, { useState, useLayoutEffect, useEffect } from "react";
import { globalStyles } from "../../theme/styles";
import { colors } from "../../theme/colors";
import { PRODUCT_CATEGORIES } from "../../data/Product";
import SearchDropdown from "../../components/search/SearchDropdown";
import {
  useNavigation,
  useRoute,
  CommonActions,
} from "@react-navigation/native";
import {
  createDoc,
  readOneDoc,
  updateOneDocInDB,
  deleteOneDocFromDB,
} from "../../services/firebase/firebaseHelper";
import { COLLECTIONS } from "../../constants/firebase";
import { ImageType, Product, BaseUserProduct, UserProduct } from "../../types";
import LoadingLogo from "../../components/loading/LoadingLogo";
import ProductImage from "../../components/ProductImage";
import EditProductImage from "../../components/EditProductImage";
import EmojiSelector from "react-native-emoji-selector";
import {
  requestMediaLibraryPermissionsAsync,
  requestCameraPermissionsAsync,
  launchImageLibraryAsync,
  launchCameraAsync,
  MediaTypeOptions,
} from "expo-image-picker";
import { useAuth } from "../../contexts/AuthContext";
import {
  createUserProduct,
  updateUserProduct,
  deleteUserProduct,
} from "../../services/userProductService";

const AddProductScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { userId } = useAuth();

  const isEditMode = route.name === "EditProduct";
  const productId = isEditMode ? route.params?.productId : null;

  const [loading, setLoading] = useState(isEditMode);
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [imageType, setImageType] = useState<ImageType | "">("");
  const [pluCode, setPluCode] = useState("");
  const [imageSource, setImageSource] = useState<string>("");
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [localImageUri, setLocalImageUri] = useState<string>("");

  // Get product data
  useEffect(() => {
    if (isEditMode && productId) {
      fetchProductData();
    }
  }, [isEditMode, productId]);

  // Fetch product data for edit mode
  const fetchProductData = async () => {
    try {
      setLoading(true);
      const userProductPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_PRODUCTS}`;

      const productData = await readOneDoc<UserProduct>(
        userProductPath,
        productId
      );

      if (productData) {
        setName(productData.name);
        setCategory(productData.category);
        setPluCode(productData.plu_code || "");
        setImageType(productData.image_type || "user_image");
        setImageSource(productData.image_source || "");
      }
    } catch (error) {
      console.error("Error fetching custom product:", error);
      Alert.alert("Error", "Failed to load custom product data");
    } finally {
      setLoading(false);
    }
  };

  // Check if we're in the HomeStack (EditProduct screen from ProductDetail)
  const isInHomeStack = () => {
    return isEditMode && route.name === "EditProduct";
  };

  // Handle navigation after operations
  const handleNavigation = () => {
    if (isInHomeStack()) {
      // If coming from HomeStack, directly go back to HomeScreen with reset
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: "Main",
              params: {
                screen: "Home",
                params: {
                  screen: "HomeScreen",
                  params: { needsRefresh: true },
                },
              },
            },
          ],
        })
      );
    } else {
      // Default behavior: go back (ProductLibrary flow)
      navigation.goBack();
    }
  };

  // Save product function
  const handleSave = async () => {
    try {
      if (!name || !category) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
      }

      const productData = {
        name,
        category,
        image_type: imageType as ImageType,
        plu_code: pluCode,
        image_source: imageSource,
        barcode: "",
      };

      if (isEditMode) {
        await updateUserProduct({
          userId: userId!,
          productId: productId!,
          productData,
          localImageUri,
        });
        Alert.alert("Success", "Custom product updated successfully!", [
          { text: "OK", onPress: handleNavigation },
        ]);
      } else {
        await createUserProduct({
          userId: userId!,
          productData,
          localImageUri,
        });
        Alert.alert("Success", "User product created successfully!", [
          { text: "OK", onPress: handleNavigation },
        ]);
      }
    } catch (error) {
      console.error("Error saving custom product:", error);
      Alert.alert(
        "Error",
        `Failed to ${isEditMode ? "update" : "create"} custom product`
      );
    }
  };

  // Delete product function
  const handleDelete = async () => {
    if (!isEditMode || !productId) return;

    Alert.alert(
      "Delete Custom Product",
      "Are you sure you want to delete this custom product? All related price records will also be deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUserProduct(userId!, productId);
              Alert.alert(
                "Success",
                "User product and related records deleted successfully",
                [{ text: "OK", onPress: handleNavigation }]
              );
            } catch (error) {
              console.error("Error deleting user product:", error);
              Alert.alert("Error", "Failed to delete the user product");
            }
          },
        },
      ]
    );
  };

  // Handle image selection methods
  const pickImage = () => {
    Alert.alert(
      "Select Image",
      "Please select image source",
      [
        {
          text: "Choose Emoji",
          onPress: () => setIsEmojiPickerVisible(true),
        },
        {
          text: "Take Photo",
          onPress: handleTakePhoto,
        },
        {
          text: "Select from Library",
          onPress: handleSelectFromLib,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const handleTakePhoto = async () => {
    const { status } = await requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Camera permission is required to take photos"
      );
      return;
    }

    const result = await launchCameraAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setLocalImageUri(result.assets[0].uri);
      setImageType("user_image");
    }
  };

  const handleSelectFromLib = async () => {
    const { status } = await requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Library permission is required to select photos"
      );
      return;
    }

    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setLocalImageUri(result.assets[0].uri);
      setImageType("user_image");
    }
  };

  if (loading) {
    return <LoadingLogo />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cardContainer}>
        {/* Picture */}
        <EditProductImage
          userId={userId as string}
          imageType={imageType as ImageType}
          imageSource={imageSource}
          localImageUri={localImageUri}
          onPress={pickImage}
        />

        {/* Inputs */}
        <View style={globalStyles.inputsContainer}>
          {/* Product Name */}
          <View style={globalStyles.inputContainer}>
            <View style={globalStyles.labelContainer}>
              <Text style={globalStyles.inputLabel}>Name</Text>
              <Text style={styles.requiredMark}>*</Text>
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
          {/* Add buttons container at the bottom */}
          {isEditMode ? (
            <View style={styles.buttonsContainer}>
              <View
                style={[globalStyles.buttonsContainer, { marginBottom: 20 }]}
              >
                <TouchableOpacity
                  style={[globalStyles.button, globalStyles.primaryButton]}
                  onPress={handleDelete}
                >
                  <Text style={globalStyles.primaryButtonText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[globalStyles.button, globalStyles.primaryButton]}
                  onPress={handleSave}
                >
                  <Text style={globalStyles.primaryButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // Add mode - show single save button
            <View style={styles.buttonsContainer}>
              <View
                style={[globalStyles.buttonsContainer, { marginBottom: 20 }]}
              >
                <TouchableOpacity
                  style={[
                    globalStyles.button,
                    globalStyles.primaryButton,
                    { flex: 1 },
                  ]}
                  onPress={handleSave}
                >
                  <Text style={globalStyles.primaryButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <Modal
          visible={isEmojiPickerVisible}
          animationType="slide"
          onRequestClose={() => setIsEmojiPickerVisible(false)}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.emojiHeader}>
              <TouchableOpacity
                onPress={() => setIsEmojiPickerVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
            <EmojiSelector
              onEmojiSelected={(emoji) => {
                setImageType("emoji");
                setImageSource(emoji);
                setIsEmojiPickerVisible(false);
              }}
              showSearchBar={true}
              showHistory={true}
              showSectionTitles={true}
              columns={8}
            />
          </SafeAreaView>
        </Modal>
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
  requiredMark: {
    color: colors.negative,
    marginLeft: 4,
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
  emojiHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray2,
  },
  closeButton: {
    alignSelf: "flex-end",
  },
  closeButtonText: {
    color: colors.primary,
    fontSize: 16,
  },
  buttonsContainer: {
    // marginHorizontal: 16,
  },
});
