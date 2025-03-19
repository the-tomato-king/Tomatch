import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Pressable,
  Keyboard,
} from "react-native";
import { Product } from "../types";
import { globalStyles } from "../theme/styles";
import { colors } from "../theme/colors";
import GeneralPressable from "./GeneralPressable";

interface ProductSearchInputProps {
  inputValue: string;
  onChangeInputValue: (text: string) => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

const ProductSearchInput = ({
  inputValue,
  onChangeInputValue,
  products,
  onSelectProduct,
}: ProductSearchInputProps) => {
  const [suggestions, setSuggestions] = useState<Product[]>(products);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (inputValue.length > 0) {
      const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filteredProducts);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue]);

  // Make sure suggestions are cleared when user already tapped on a suggestion
  useEffect(() => {
    if (!showSuggestions) {
      setSuggestions([]);
    }
  }, [showSuggestions]);

  return (
    <View style={styles.wrapper}>
      <View style={[globalStyles.inputContainer]}>
        <View style={globalStyles.labelContainer}>
          <Text style={globalStyles.inputLabel}>Name</Text>
        </View>
        <TextInput
          style={[globalStyles.input]}
          value={inputValue}
          onChangeText={onChangeInputValue}
          placeholder="Search product..."
          onFocus={() => setShowSuggestions(true)}
        />
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.product_id || item.name}
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
});

export default ProductSearchInput;
