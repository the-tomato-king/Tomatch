import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Product } from "../types";
import { globalStyles } from "../theme/styles";
import { colors } from "../theme/colors";

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
  }, [inputValue, products]);

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <View style={[globalStyles.inputContainer, styles.container]}>
      <View style={globalStyles.labelContainer}>
        <Text style={globalStyles.inputLabel}>Name</Text>
      </View>
      <TextInput
        style={[globalStyles.input]}
        value={inputValue}
        onChangeText={onChangeInputValue}
        placeholder="Search product..."
        onFocus={() => setShowSuggestions(true)}
        onBlur={handleBlur}
      />
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            style={{ flex: 1 }}
            data={suggestions}
            keyExtractor={(item) => item.product_id || item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  onSelectProduct(item);
                  setShowSuggestions(false);
                }}
              >
                <Text style={styles.suggestionItem}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 1,
    // flex: 1,
  },
  suggestionsContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 8,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionItem: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray2,
  },
});

export default ProductSearchInput;
