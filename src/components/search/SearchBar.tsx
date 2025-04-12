import { StyleSheet, TextInput, View } from "react-native";
import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  containerStyle?: object;
}

const SearchBar = ({
  placeholder = "Search",
  value,
  onChangeText,
  onFocus,
  onBlur,
  autoFocus = false,
  containerStyle,
}: SearchBarProps) => {
  return (
    <View style={[styles.searchBarContainer, containerStyle]}>
      <View style={styles.searchBar}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={colors.ios.tertiaryLabel}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor={colors.ios.tertiaryLabel}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          autoFocus={autoFocus}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchBarContainer: {
    height: 36,
    backgroundColor: colors.ios.secondarySystemGroupedBackground,
    borderRadius: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    marginLeft: 8,
    fontSize: 17,
    color: colors.ios.label,
  },
});

export default SearchBar;
