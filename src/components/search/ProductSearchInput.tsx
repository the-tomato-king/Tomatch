import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Product, UserProduct } from "../../types";
import { globalStyles } from "../../theme/styles";
import { colors } from "../../theme/colors";
import GeneralPressable from "../buttons/GeneralPressable";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { searchProducts, getAllProducts } from "../../services/productService";

type ProductSearchNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

interface ProductSearchInputProps {
  value: string;
  selectedProduct: Product | null;
  onChangeText: (text: string) => void;
  onSelectProduct: (product: Product) => void;
  onNavigateToLibrary?: () => void;
}

const ProductSearchInput: React.FC<ProductSearchInputProps> = ({
  value,
  selectedProduct,
  onChangeText,
  onSelectProduct,
  onNavigateToLibrary,
}) => {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // search products
  useEffect(() => {
    if (value.trim().length > 0) {
      const results = searchProducts(value);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value]);

  return (
    <TouchableWithoutFeedback onPress={() => setShowSuggestions(false)}>
      <View style={styles.wrapper}>
        <View style={[globalStyles.inputContainer]}>
          <View style={globalStyles.labelContainer}>
            <Text style={globalStyles.inputLabel}>Product</Text>
          </View>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[globalStyles.input]}
              value={value}
              onChangeText={onChangeText}
              placeholder="Search product..."
              onFocus={() => setShowSuggestions(true)}
            />
            {!selectedProduct && value.length > 0 && onNavigateToLibrary && (
              <GeneralPressable
                containerStyle={styles.questionIcon}
                onPress={onNavigateToLibrary}
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
                  }}
                >
                  <Text style={styles.suggestionText}>{item.name}</Text>
                </GeneralPressable>
              )}
            />
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
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
