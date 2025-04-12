import React, { useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../../theme/colors";
import { globalStyles } from "../../theme/styles";
import DropDownPicker from "react-native-dropdown-picker";
import { CURRENCIES } from "../../constants/currencies";

interface CurrencyModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (currency: string) => void;
  initialCurrency: string;
}

const CurrencyModal = ({
  visible,
  onClose,
  onSave,
  initialCurrency,
}: CurrencyModalProps) => {
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState(initialCurrency);

  const handleSave = () => {
    onSave(currency);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Display Currency</Text>
          <DropDownPicker
            open={open}
            value={currency}
            items={CURRENCIES.map((currency) => ({
              label: currency.name,
              value: currency.code,
            }))}
            setOpen={setOpen}
            setValue={setCurrency}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            textStyle={styles.dropdownText}
          />
          <Text style={styles.modalDescription}>
            Only changes the currency display.
          </Text>

          <View style={globalStyles.buttonsContainer}>
            <TouchableOpacity
              style={[globalStyles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[globalStyles.button, globalStyles.primaryButton]}
              onPress={handleSave}
            >
              <Text style={globalStyles.primaryButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  dropdown: {
    marginBottom: 16,
    borderColor: colors.lightGray2,
  },
  dropdownContainer: {
    borderColor: colors.lightGray2,
  },
  dropdownText: {
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: colors.lightGray2,
  },
  cancelButtonText: {
    color: colors.darkText,
    fontSize: 16,
    fontWeight: "600",
  },
  modalDescription: {
    width: "100%",
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 16,
    textAlign: "center",
  },
});

export default CurrencyModal;
