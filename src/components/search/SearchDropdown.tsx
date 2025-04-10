import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { globalStyles } from "../../theme/styles";
import { colors } from "../../theme/colors";
import DropDownPicker from "react-native-dropdown-picker";

interface SearchDropdownProps {
  label: string;
  value: string | null | undefined;
  items: Array<{
    label: string;
    value: string;
    [key: string]: any;
  }>;
  onChangeValue: (value: string) => void;
  onSelectItem?: (item: any) => void;
  placeholder?: string;
  disabled?: boolean;
}

const SearchDropdown = ({
  label,
  value,
  items,
  onChangeValue,
  onSelectItem,
  placeholder = "Select an option",
  disabled = false,
}: SearchDropdownProps) => {
  const [open, setOpen] = useState(false);

  const handleValueChange = (itemValue: string | null) => {
    if (!itemValue) return;
    onChangeValue(itemValue);

    if (onSelectItem) {
      const selectedItem = items.find((item) => item.value === itemValue);
      if (selectedItem) {
        onSelectItem(selectedItem);
      }
    }
  };

  return (
    <View style={globalStyles.inputContainer}>
      <View style={globalStyles.labelContainer}>
        <Text style={globalStyles.inputLabel}>{label}</Text>
      </View>
      <View style={styles.inputWrapper}>
        <DropDownPicker
          open={open}
          value={value || null}
          items={items}
          setOpen={setOpen}
          setValue={handleValueChange as any}
          placeholder={placeholder}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          textStyle={styles.dropdownText}
          placeholderStyle={styles.placeholderText}
          listItemLabelStyle={styles.listItemLabel}
          listItemContainerStyle={styles.listItemContainer}
          ArrowDownIconComponent={() => <Text style={styles.arrowIcon}>▼</Text>}
          ArrowUpIconComponent={() => <Text style={styles.arrowIcon}>▲</Text>}
          disabled={disabled}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopLeftRadius: 8,
    width: "30%",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.darkText,
  },
  inputWrapper: {
    flex: 1,
    position: "relative",
    zIndex: 2,
  },
  dropdown: {
    backgroundColor: colors.lightGray2,
    width: "100%",
    borderWidth: 0,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  dropdownContainer: {
    backgroundColor: colors.white,
    borderColor: colors.lightGray,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
  },
  dropdownText: {
    fontSize: 16,
    color: colors.darkText,
  },
  placeholderText: {
    color: colors.secondaryText,
  },
  listItemLabel: {
    fontSize: 16,
    color: colors.darkText,
  },
  listItemContainer: {
    height: 50,
    padding: 8,
  },
  arrowIcon: {
    fontSize: 14,
    color: colors.secondaryText,
  },
});

export default SearchDropdown;
