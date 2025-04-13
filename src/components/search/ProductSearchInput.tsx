import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { Product, UserProduct } from "../../types";
import { globalStyles } from "../../theme/styles";
import { colors } from "../../theme/colors";
import GeneralPressable from "../buttons/GeneralPressable";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { useProductSearch } from "../../hooks/useProductSearch";
import { Ionicons } from "@expo/vector-icons";

type ProductSearchNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

interface ProductSearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  selectedProduct?: Product | null;
  onSelectProduct?: (product: Product) => void;
  onNavigateToLibrary?: () => void;
}

const ProductSearchInput: React.FC<ProductSearchInputProps> = ({
  value,
  onChangeText,
  selectedProduct,
  onSelectProduct,
  onNavigateToLibrary,
}) => {
  const { suggestions, setSearchTerm } = useProductSearch();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (text: string) => {
    onChangeText(text);
    setSearchTerm(text);
    setShowSuggestions(true);
  };

  return (
    <TouchableWithoutFeedback onPress={() => setShowSuggestions(false)}>
      <View style={styles.wrapper}>
        <View style={[globalStyles.inputContainer]}>
          <View style={globalStyles.labelContainer}>
            <MaterialCommunityIcons
              name="food-apple"
              size={18}
              color={colors.primary}
            />
          </View>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[globalStyles.input]}
              value={value}
              onChangeText={handleInputChange}
              placeholder="Search product..."
              placeholderTextColor={colors.secondaryText}
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
                    onSelectProduct && onSelectProduct(item);
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
    borderRadius: 12,
    maxHeight: 200,
    marginTop: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: Platform.OS === "ios" ? 0.5 : 1,
    borderBottomColor: colors.lightGray2,
  },
  suggestionText: {
    fontSize: 16,
    color: colors.darkText,
    ...Platform.select({
      ios: {
        fontWeight: "400",
      },
      android: {
        fontFamily: "sans-serif",
      },
    }),
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
