import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { globalStyles } from "../theme/styles";
import { colors } from "../theme/colors";
import { COLLECTIONS } from "../constants/firebase";
import { readAllDocs } from "../services/firebase/firebaseHelper";
import { UserStore } from "../types";
import DropDownPicker from "react-native-dropdown-picker";
import { useAuth } from "../contexts/AuthContext";
interface StoreSearchInputProps {
  inputValue: string;
  onChangeInputValue: (value: string) => void;
  onSelectStore: (store: UserStore) => void;
  initialStoreId?: string;
  disabled?: boolean;
}

const StoreSearchInput = ({
  inputValue,
  onChangeInputValue,
  onSelectStore,
  initialStoreId,
  disabled,
}: StoreSearchInputProps) => {
  const [stores, setStores] = useState<UserStore[]>([]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(initialStoreId || null);
  const [items, setItems] = useState([]);
  const { userId } = useAuth();
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const storesPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.USER_STORES}`;
        const storesData = await readAllDocs<UserStore>(storesPath);
        setStores(storesData);

        const dropdownItems = storesData.map((store) => ({
          label: store.name,
          value: store.id,
          store: store,
        }));

        setItems(dropdownItems as any);

        if (initialStoreId) {
          setValue(initialStoreId);
          const selectedStore = storesData.find(
            (store) => store.id === initialStoreId
          );
          if (selectedStore) {
            onSelectStore(selectedStore);
            onChangeInputValue(selectedStore.name);
          }
        } else if (inputValue) {
          const selectedStore = storesData.find(
            (store) => store.name === inputValue
          );
          if (selectedStore) {
            setValue(selectedStore.id);
            onSelectStore(selectedStore);
          }
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };

    fetchStores();
  }, [initialStoreId, userId]);

  const handleValueChange = (itemValue: string | null) => {
    if (!itemValue) return;

    const selectedStore = stores.find((store) => store.id === itemValue);
    if (selectedStore) {
      onSelectStore(selectedStore);
      onChangeInputValue(selectedStore.name);
    }
  };

  return (
    <View style={globalStyles.inputContainer}>
      <View style={globalStyles.labelContainer}>
        <Text style={globalStyles.inputLabel}>Store</Text>
      </View>
      <View style={styles.inputWrapper}>
        <DropDownPicker
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={setValue}
          setItems={setItems as any}
          onChangeValue={(value: string | null) => handleValueChange(value)}
          placeholder="Select a store"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          textStyle={styles.dropdownText}
          placeholderStyle={styles.placeholderText}
          listItemLabelStyle={styles.listItemLabel}
          listItemContainerStyle={styles.listItemContainer}
          ArrowDownIconComponent={() => <Text style={styles.arrowIcon}>▼</Text>}
          ArrowUpIconComponent={() => <Text style={styles.arrowIcon}>▲</Text>}
          zIndex={3000}
          zIndexInverse={1000}
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

export default StoreSearchInput;
