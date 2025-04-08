import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Text, FlatList } from "react-native";
import { Product, UserProduct } from "../types";
import { globalStyles } from "../theme/styles";
import { colors } from "../theme/colors";
import GeneralPressable from "./GeneralPressable";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useProducts } from "../hooks/useProducts";
import { searchProducts } from "../services/productService";

type ProductSearchNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

interface ProductSearchInputProps {
  inputValue: string;
  onChangeInputValue: (text: string) => void;
  onSelectProduct: (product: Product) => void;
}

const ProductSearchInput = ({
  inputValue,
  onChangeInputValue,
  onSelectProduct,
}: ProductSearchInputProps) => {
  const { products, loading } = useProducts();
  const [suggestions, setSuggestions] = useState<Product[]>(products);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const navigation = useNavigation<ProductSearchNavigationProp>();

  useEffect(() => {
    if (inputValue.length > 0) {
      // TODO: We are using local products now, use firebase to get products
      const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filteredProducts);
      setShowSuggestions(true);
      setIsNewProduct(
        !products.some(
          (product) => product.name.toLowerCase() === inputValue.toLowerCase()
        )
      );
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsNewProduct(false);
    }
  }, [inputValue, products]);

  // Make sure suggestions are cleared when user already tapped on a suggestion
  useEffect(() => {
    if (!showSuggestions) {
      setSuggestions([]);
    }
  }, [showSuggestions]);

  useEffect(() => {
    // 当输入变化时搜索本地产品库
    if (inputValue.trim()) {
      const results = searchProducts(inputValue);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  }, [inputValue]);

  return (
    <View style={styles.wrapper}>
      <View style={[globalStyles.inputContainer]}>
        <View style={globalStyles.labelContainer}>
          <Text style={globalStyles.inputLabel}>Product</Text>
        </View>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[globalStyles.input]}
            value={inputValue}
            onChangeText={onChangeInputValue}
            placeholder="Search product..."
            onFocus={() => setShowSuggestions(true)}
          />
          {isNewProduct && inputValue.length > 0 && (
            <GeneralPressable
              containerStyle={styles.questionIcon}
              onPress={() => {
                navigation.navigate("ProductLibrary", {
                  onSelectProduct: (product) => {
                    onSelectProduct(product);
                    setShowSuggestions(false);
                    setSuggestions([]);
                  },
                  initialSearchText: inputValue,
                });
              }}
            >
              <MaterialCommunityIcons
                name="help-circle-outline"
                size={24}
                color={colors.negative}
              />
            </GeneralPressable>
          )}
        </View>
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.name}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <GeneralPressable
                containerStyle={styles.suggestionItem}
                onPress={() => {
                  onSelectProduct(item);
                  setShowSuggestions(false);
                  setSuggestions([]);
                }}
              >
                <Text style={styles.suggestionText}>{item.name}</Text>
              </GeneralPressable>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    zIndex: 1000,
  },
  suggestionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 8,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    zIndex: 1001,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray2,
  },
  suggestionText: {
    fontSize: 16,
    color: colors.darkText,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  questionIcon: {
    marginRight: 15,
  },
});

export default ProductSearchInput;
